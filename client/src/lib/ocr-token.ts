// Private-access token for the photo feature (see server/ocr.ts).
// Open the site once as https://your-site/?ocr=<token>; the token is saved in
// this browser and removed from the address bar. Without it the photo button
// never appears.
const KEY = 'ocrToken';

export function captureOcrTokenFromUrl(): void {
  try {
    const url = new URL(window.location.href);
    const t = url.searchParams.get('ocr');
    if (t) {
      localStorage.setItem(KEY, t);
      url.searchParams.delete('ocr');
      window.history.replaceState({}, '', url.pathname + url.search + url.hash);
    }
  } catch {
    /* storage can be blocked; the feature simply stays hidden */
  }
}

export function ocrHeaders(): Record<string, string> {
  try {
    const t = localStorage.getItem(KEY);
    return t ? { 'x-ocr-token': t } : {};
  } catch {
    return {};
  }
}
