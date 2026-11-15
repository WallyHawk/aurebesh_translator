import { z } from "zod";

// Translation History Entry
export const historyEntrySchema = z.object({
  id: z.string(),
  english: z.string(),
  aurebesh: z.string(),
  favorite: z.boolean().default(false),
  timestamp: z.string(), // ISO date string
});

export const insertHistoryEntrySchema = historyEntrySchema.omit({ id: true });

export type HistoryEntry = z.infer<typeof historyEntrySchema>;
export type InsertHistoryEntry = z.infer<typeof insertHistoryEntrySchema>;

// Saved Phrases
export const savedPhraseSchema = z.object({
  id: z.string(),
  phrase: z.string(),
  timestamp: z.string(),
});

export const insertSavedPhraseSchema = savedPhraseSchema.omit({ id: true });

export type SavedPhrase = z.infer<typeof savedPhraseSchema>;
export type InsertSavedPhrase = z.infer<typeof insertSavedPhraseSchema>;

// Game Progress
export const gameProgressSchema = z.object({
  id: z.string(),
  unlockedTiers: z.array(z.number()).default([1]),
  flashcardStats: z.object({
    tier1Score: z.number().default(0),
    tier2Score: z.number().default(0),
    tier3Score: z.number().default(0),
  }).default({}),
});

export const insertGameProgressSchema = gameProgressSchema.omit({ id: true });

export type GameProgress = z.infer<typeof gameProgressSchema>;
export type InsertGameProgress = z.infer<typeof insertGameProgressSchema>;

// Settings
export const settingsSchema = z.object({
  id: z.string(),
  theme: z.enum(["Rebel", "Imperial", "Light Side", "Dark Side", "Bounty Hunter"]).default("Rebel"),
  fontSize: z.number().min(16).max(32).default(20),
});

export const insertSettingsSchema = settingsSchema.omit({ id: true });

export type Settings = z.infer<typeof settingsSchema>;
export type InsertSettings = z.infer<typeof insertSettingsSchema>;

// Photo translation (vision model reads Aurebesh glyphs from a photo)
// One glyph = one Aurebesh character as Latin text: a single letter, or a
// digraph such as "th". "?" means the glyph could not be read. `alt` lists
// other letters the model considered, used for tap-to-fix in the UI.
export const ocrGlyphSchema = z.object({
  g: z.string().min(1).max(2),
  alt: z.array(z.string().min(1).max(2)).max(3).optional(),
});

export const ocrWordSchema = z.object({
  glyphs: z.array(ocrGlyphSchema).min(1).max(60),
  lineBreakAfter: z.boolean().optional(),
});

export const ocrResponseSchema = z.object({
  words: z.array(ocrWordSchema).max(200),
});

export type OcrGlyph = z.infer<typeof ocrGlyphSchema>;
export type OcrWord = z.infer<typeof ocrWordSchema>;
export type OcrResponse = z.infer<typeof ocrResponseSchema>;
