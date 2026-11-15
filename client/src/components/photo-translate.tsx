import { useEffect, useRef, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Camera, Image as ImageIcon, Loader2 } from 'lucide-react';
import { englishToAurebesh } from '@/lib/aurebesh';
import type { OcrResponse } from '@shared/schema';

interface PhotoTranslateProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onResult: (englishText: string) => void;
}

type Step = 'pick' | 'crop' | 'reading' | 'review';
type Rect = { x: number; y: number; w: number; h: number };

// Glyphs that look alike. Any letter in one of these groups can be tapped to
// cycle through its lookalikes, whether or not the reader flagged it.
const CONFUSABLE_GROUPS = [
  ['l', 's'],
  ['j', 'z'],
  ['g', 'u', 'd'],
  ['k', 'ch'],
  ['r', 'd'],
];

interface ReviewGlyph {
  options: string[]; // options[sel] is the current reading
  sel: number;
  flagged: boolean; // the reader said it was unsure
  confusable: boolean; // belongs to a lookalike group
}
interface ReviewWord {
  glyphs: ReviewGlyph[];
  lineBreakAfter?: boolean;
}

function buildReview(result: OcrResponse): ReviewWord[] {
  return result.words.map((w) => ({
    lineBreakAfter: w.lineBreakAfter,
    glyphs: w.glyphs.map((gl) => {
      const g = gl.g.toLowerCase();
      const lookalikes = CONFUSABLE_GROUPS.filter((grp) => grp.includes(g)).flat();
      const options = Array.from(
        new Set([g, ...(gl.alt || []).map((a) => a.toLowerCase()), ...lookalikes]),
      );
      return {
        options,
        sel: 0,
        flagged: g === '?' || (gl.alt?.length ?? 0) > 0,
        confusable: lookalikes.length > 0,
      };
    }),
  }));
}

function reviewToText(words: ReviewWord[]): string {
  let out = '';
  words.forEach((w, i) => {
    out += w.glyphs.map((g) => g.options[g.sel]).join('');
    out += w.lineBreakAfter ? '\n' : i < words.length - 1 ? ' ' : '';
  });
  return out;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export function PhotoTranslate({ open, onOpenChange, onResult }: PhotoTranslateProps) {
  const [step, setStep] = useState<Step>('pick');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [rect, setRect] = useState<Rect | null>(null);
  const [review, setReview] = useState<ReviewWord[]>([]);
  const [error, setError] = useState<string | null>(null);

  const imgRef = useRef<HTMLImageElement>(null);
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const cameraInput = useRef<HTMLInputElement>(null);
  const libraryInput = useRef<HTMLInputElement>(null);

  const reset = () => {
    setStep('pick');
    setRect(null);
    setReview([]);
    setError(null);
    setImageUrl((u) => {
      if (u) URL.revokeObjectURL(u);
      return null;
    });
    setPreviewUrl((u) => {
      if (u) URL.revokeObjectURL(u);
      return null;
    });
  };

  useEffect(() => {
    if (!open) reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const onFile = (file: File | undefined) => {
    if (!file) return;
    setError(null);
    setRect(null);
    setImageUrl((u) => {
      if (u) URL.revokeObjectURL(u);
      return URL.createObjectURL(file);
    });
    setStep('crop');
  };

  // ---- crop box (pointer events work for mouse and touch)
  const pointInImage = (e: React.PointerEvent) => {
    const b = imgRef.current!.getBoundingClientRect();
    return { x: clamp(e.clientX - b.left, 0, b.width), y: clamp(e.clientY - b.top, 0, b.height) };
  };
  const onPointerDown = (e: React.PointerEvent) => {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    const p = pointInImage(e);
    dragStart.current = p;
    setRect({ x: p.x, y: p.y, w: 0, h: 0 });
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragStart.current) return;
    const p = pointInImage(e);
    const s = dragStart.current;
    setRect({ x: Math.min(s.x, p.x), y: Math.min(s.y, p.y), w: Math.abs(p.x - s.x), h: Math.abs(p.y - s.y) });
  };
  const onPointerUp = () => {
    dragStart.current = null;
    setRect((r) => (r && (r.w < 16 || r.h < 16) ? null : r));
  };

  // ---- crop, scale up small crops, send to the server
  const readIt = async () => {
    const img = imgRef.current;
    if (!img) return;
    setStep('reading');
    setError(null);
    try {
      const k = img.naturalWidth / img.clientWidth;
      const sx = rect ? rect.x * k : 0;
      const sy = rect ? rect.y * k : 0;
      const sw = rect ? rect.w * k : img.naturalWidth;
      const sh = rect ? rect.h * k : img.naturalHeight;

      // Small crops are scaled up (up to 4x); very large ones are scaled down.
      const longest = Math.max(sw, sh);
      const scale = longest < 1200 ? Math.min(4, 1200 / longest) : Math.min(1, 1600 / longest);
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(sw * scale));
      canvas.height = Math.max(1, Math.round(sh * scale));
      const ctx = canvas.getContext('2d')!;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);

      const blob: Blob = await new Promise((resolve, reject) =>
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not prepare the image'))), 'image/jpeg', 0.9),
      );
      setPreviewUrl((u) => {
        if (u) URL.revokeObjectURL(u);
        return URL.createObjectURL(blob);
      });

      const form = new FormData();
      form.append('image', blob, 'crop.jpg');
      const res = await fetch('/api/ocr', { method: 'POST', body: form });
      if (!res.ok) {
        let message = 'Photo translation failed. Try again.';
        try {
          message = (await res.json()).error || message;
        } catch {
          /* keep default */
        }
        throw new Error(message);
      }
      const data = (await res.json()) as OcrResponse;
      if (!data.words.length) throw new Error('No Aurebesh found. Try cropping closer to the text.');
      setReview(buildReview(data));
      setStep('review');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Photo translation failed.');
      setStep('crop');
    }
  };

  const cycle = (wi: number, gi: number) => {
    setReview((prev) =>
      prev.map((w, i) =>
        i !== wi
          ? w
          : {
              ...w,
              glyphs: w.glyphs.map((g, j) =>
                j !== gi || g.options.length < 2 ? g : { ...g, sel: (g.sel + 1) % g.options.length },
              ),
            },
      ),
    );
  };

  const text = reviewToText(review);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card text-card-foreground border-border max-w-lg max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-card-foreground">Translate a photo</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {step === 'pick' && 'Take a photo or choose one with Aurebesh text in it.'}
            {step === 'crop' && 'Drag a box around the Aurebesh. Closer crops read better.'}
            {step === 'reading' && 'Reading the glyphs...'}
            {step === 'review' && 'Check each letter against your photo. Tap a marked letter to swap it.'}
          </DialogDescription>
        </DialogHeader>

        {/* Hidden inputs: "capture" opens the camera on phones */}
        <input
          ref={cameraInput}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            onFile(e.target.files?.[0]);
            e.target.value = '';
          }}
          data-testid="input-photo-camera"
        />
        <input
          ref={libraryInput}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            onFile(e.target.files?.[0]);
            e.target.value = '';
          }}
          data-testid="input-photo-library"
        />

        {error && (
          <p className="text-sm text-destructive" role="alert" data-testid="text-photo-error">
            {error}
          </p>
        )}

        {step === 'pick' && (
          <div className="grid grid-cols-2 gap-3">
            <Button onClick={() => cameraInput.current?.click()} className="h-24 flex-col gap-2" data-testid="button-take-photo">
              <Camera className="h-6 w-6" />
              Take photo
            </Button>
            <Button
              variant="secondary"
              onClick={() => libraryInput.current?.click()}
              className="h-24 flex-col gap-2"
              data-testid="button-choose-photo"
            >
              <ImageIcon className="h-6 w-6" />
              Choose photo
            </Button>
          </div>
        )}

        {step === 'crop' && imageUrl && (
          <div className="space-y-3">
            <div className="flex justify-center">
              <div
                className="relative inline-block touch-none select-none cursor-crosshair"
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
                data-testid="crop-area"
              >
                <img
                  ref={imgRef}
                  src={imageUrl}
                  alt="Your photo"
                  draggable={false}
                  className="block max-h-[50vh] max-w-full"
                />
                {rect && rect.w > 0 && (
                  <div
                    className="absolute border-2 border-primary bg-primary/10 pointer-events-none"
                    style={{ left: rect.x, top: rect.y, width: rect.w, height: rect.h }}
                  />
                )}
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={reset}>
                Different photo
              </Button>
              <Button onClick={readIt} data-testid="button-read-photo">
                {rect ? 'Read selection' : 'Read whole photo'}
              </Button>
            </div>
          </div>
        )}

        {step === 'reading' && (
          <div className="flex flex-col items-center gap-3 py-8 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="text-sm">This takes a few seconds.</span>
          </div>
        )}

        {step === 'review' && (
          <div className="space-y-4">
            {previewUrl && (
              <img src={previewUrl} alt="Cropped text" className="mx-auto max-h-32 max-w-full rounded border border-border" />
            )}

            <div className="space-y-3" data-testid="review-glyphs">
              {review.map((w, wi) => (
                <div key={wi} className="flex flex-wrap gap-1">
                  {w.glyphs.map((g, gi) => {
                    const current = g.options[g.sel];
                    const tappable = g.options.length > 1;
                    const border =
                      current === '?'
                        ? 'border-destructive'
                        : g.flagged
                          ? 'border-amber-500'
                          : g.confusable
                            ? 'border-dashed border-border'
                            : 'border-transparent';
                    return (
                      <button
                        key={gi}
                        type="button"
                        disabled={!tappable}
                        onClick={() => cycle(wi, gi)}
                        className={`flex min-w-[2.75rem] flex-col items-center rounded border-2 px-1 py-1 ${border} ${
                          tappable ? 'cursor-pointer hover:bg-accent' : 'cursor-default'
                        }`}
                        aria-label={`Letter ${current}${tappable ? ', tap to change' : ''}`}
                      >
                        <span className="font-aurebesh text-3xl leading-none">{englishToAurebesh(current)}</span>
                        <span className="mt-1 text-xs text-muted-foreground">{current}</span>
                      </button>
                    );
                  })}
                  {wi < review.length - 1 && <span className="w-4" />}
                </div>
              ))}
            </div>

            <p className="text-xs text-muted-foreground">
              Orange = the reader was unsure. Dashed = a letter that is easy to mix up. Compare the glyph shown
              with your photo.
            </p>

            <p className="whitespace-pre-wrap rounded border border-border bg-muted p-3 text-lg text-card-foreground" data-testid="text-photo-result">
              {text}
            </p>

            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setStep('crop')}>
                Re-crop
              </Button>
              <Button
                onClick={() => {
                  onResult(text.toLowerCase());
                  onOpenChange(false);
                }}
                data-testid="button-use-photo-result"
              >
                Use this translation
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
