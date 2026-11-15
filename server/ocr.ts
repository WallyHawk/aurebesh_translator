import type { Express, Request, Response } from "express";
import multer from "multer";
import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import path from "path";
import { ocrResponseSchema } from "@shared/schema";

/**
 * Photo -> English translation.
 *
 * Off by default. Turn it on in Railway with:
 *   OCR_ENABLED=true
 *   ANTHROPIC_API_KEY=...
 * Optional:
 *   OCR_MODEL            (default claude-sonnet-5-5)
 *   OCR_DAILY_CAP        total reads per UTC day across all visitors (default 200)
 *   OCR_PER_IP_PER_HOUR  reads per visitor per hour (default 8)
 *
 * The endpoint costs money per call, so every request passes three gates:
 * the on/off switch, canUseOcr() (the premium hook), and the rate limits.
 */

const MODEL = process.env.OCR_MODEL || "claude-sonnet-5-5";
const DAILY_CAP = parseInt(process.env.OCR_DAILY_CAP || "200", 10);
const PER_IP_PER_HOUR = parseInt(process.env.OCR_PER_IP_PER_HOUR || "8", 10);
const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_BYTES, files: 1 },
});

function ocrEnabled(): boolean {
  return process.env.OCR_ENABLED === "true" && !!process.env.ANTHROPIC_API_KEY;
}

/**
 * PREMIUM HOOK. Today everyone passes (the feature is gated by OCR_ENABLED
 * and the rate limits). When premium exists, check the user's entitlement
 * here and return false for free users.
 */
async function canUseOcr(_req: Request): Promise<boolean> {
  return true;
}

// ---- rate limits (in memory; resets on deploy, which is fine for a cost guard)
const perIpHits = new Map<string, number[]>();
let dayKey = "";
let dayCount = 0;

function checkLimits(ip: string): "ok" | "visitor" | "daily" {
  const today = new Date().toISOString().slice(0, 10);
  if (today !== dayKey) {
    dayKey = today;
    dayCount = 0;
  }
  if (dayCount >= DAILY_CAP) return "daily";

  const now = Date.now();
  const recent = (perIpHits.get(ip) || []).filter((t) => now - t < 3600_000);
  if (recent.length >= PER_IP_PER_HOUR) {
    perIpHits.set(ip, recent);
    return "visitor";
  }
  recent.push(now);
  perIpHits.set(ip, recent);
  dayCount += 1;
  return "ok";
}

// ---- prompt
let referenceImageB64: string | null = null;
function getReferenceImage(): string {
  if (!referenceImageB64) {
    const file = path.resolve(process.cwd(), "server/assets/aurebesh-reference.png");
    referenceImageB64 = fs.readFileSync(file).toString("base64");
  }
  return referenceImageB64;
}

const SYSTEM_PROMPT = `You transcribe text written in the Aurebesh alphabet from photos.

The first image is the reference alphabet: every glyph with its Latin letter and name. The second image is the photo to read. Compare each glyph in the photo against the reference shapes and report which reference glyph it matches.

Rules:
- Transcribe glyph by glyph. Do NOT autocorrect to English words. Names, nicknames and invented words are common, so a result that is not a dictionary word is fine and expected.
- Eight glyphs are digraphs and count as ONE glyph each: ae, ch, eo, kh, ng, oo, sh, th. Report them as the two-letter value, for example {"g":"th"}.
- These groups look alike. Look carefully, and when you cannot tell, list the other candidates in "alt":
  - leth (l) versus senth (s): senth has an extra short diagonal stroke.
  - jenth (j) versus zerek (z): zerek has a flat base and a bar on its left.
  - grek (g), usk (u) and dorn (d) are all box-like shapes. Dorn is a 7 with a bar through it.
  - krill (k) versus cherek (ch), and resh (r) versus dorn (d).
- Use "alt" only when you are genuinely unsure, with at most 3 alternatives.
- If a glyph is unreadable, report {"g":"?"}.
- Ignore anything that is not Aurebesh (Latin text, logos, backgrounds).
- Group glyphs into words by the spacing in the photo. Set "lineBreakAfter": true on the last word of each line when the text has multiple lines.

Reply with JSON only, no prose and no code fence, in exactly this shape:
{"words":[{"glyphs":[{"g":"k"},{"g":"e"},{"g":"l","alt":["s"]}],"lineBreakAfter":false}]}`;

function extractJson(text: string): unknown {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end <= start) throw new Error("no JSON in model reply");
  return JSON.parse(text.slice(start, end + 1));
}

function clientIp(req: Request): string {
  return req.ip || req.socket.remoteAddress || "unknown";
}

export function registerOcrRoutes(app: Express) {
  // Railway sits behind a proxy; this makes req.ip the visitor, not the proxy.
  app.set("trust proxy", 1);

  // The client calls this to decide whether to show the photo button at all.
  app.get("/api/ocr/status", (_req, res) => {
    res.json({ enabled: ocrEnabled() });
  });

  app.post(
    "/api/ocr",
    (req: Request, res: Response, next) => {
      if (!ocrEnabled()) {
        return res.status(503).json({ error: "Photo translation is not available right now." });
      }
      upload.single("image")(req, res, (err: unknown) => {
        if (err) {
          const tooBig = (err as { code?: string }).code === "LIMIT_FILE_SIZE";
          return res
            .status(tooBig ? 413 : 400)
            .json({ error: tooBig ? "That image is too large." : "Could not read the upload." });
        }
        next();
      });
    },
    async (req: Request, res: Response) => {
      try {
        if (!(await canUseOcr(req))) {
          return res.status(402).json({ error: "Photo translation is a premium feature." });
        }

        const file = req.file;
        if (!file || !ALLOWED_TYPES.has(file.mimetype)) {
          return res.status(400).json({ error: "Send one JPEG, PNG or WebP image." });
        }

        const limit = checkLimits(clientIp(req));
        if (limit === "daily") {
          return res.status(429).json({ error: "Photo translation is busy today. Try again tomorrow." });
        }
        if (limit === "visitor") {
          return res.status(429).json({ error: "You have reached the hourly limit. Try again later." });
        }

        const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
        const response = await client.messages.create({
          model: MODEL,
          max_tokens: 2000,
          system: SYSTEM_PROMPT,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "image",
                  source: { type: "base64", media_type: "image/png", data: getReferenceImage() },
                  cache_control: { type: "ephemeral" },
                },
                {
                  type: "image",
                  source: {
                    type: "base64",
                    media_type: file.mimetype as "image/jpeg" | "image/png" | "image/webp",
                    data: file.buffer.toString("base64"),
                  },
                },
                { type: "text", text: "Transcribe the Aurebesh in the second image." },
              ],
            },
          ],
        });

        const text = response.content
          .map((b) => (b.type === "text" ? b.text : ""))
          .join("");
        const parsed = ocrResponseSchema.safeParse(extractJson(text));
        if (!parsed.success) {
          return res.status(502).json({ error: "The reader returned something unexpected. Try again." });
        }
        res.json(parsed.data);
      } catch (error) {
        console.error("OCR failed:", error instanceof Error ? error.message : error);
        res.status(502).json({ error: "Photo translation failed. Try again." });
      }
    },
  );
}
