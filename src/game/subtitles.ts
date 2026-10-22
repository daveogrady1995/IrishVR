export interface Cue {
  start: number;
  end: number;
  text: string;
}

const toSeconds = (stamp: string) => {
  const parts = stamp.trim().replace(",", ".").split(":").map(Number);
  return parts.reduce((acc, p) => acc * 60 + p, 0);
};

// Parses both WebVTT and SubRip.
export function parseSubtitles(raw: string): Cue[] {
  const cues: Cue[] = [];
  for (const block of raw.replace(/\r/g, "").split(/\n\n+/)) {
    const lines = block.split("\n");
    const i = lines.findIndex((l) => l.includes("-->"));
    if (i === -1) continue;
    const [a, b] = lines[i].split("-->");
    const start = toSeconds(a);
    const end = toSeconds(b.trim().split(/\s+/)[0]);
    const text = lines
      .slice(i + 1)
      .join("\n")
      .replace(/<[^>]+>/g, "")
      .trim();
    if (text && Number.isFinite(start) && Number.isFinite(end)) {
      cues.push({ start, end, text });
    }
  }
  return cues.sort((x, y) => x.start - y.start);
}

const cache = new Map<string, Promise<Cue[]>>();

export function loadSubtitles(url: string): Promise<Cue[]> {
  let p = cache.get(url);
  if (!p) {
    p = fetch(url)
      .then((r) => (r.ok ? r.text() : Promise.reject(new Error(r.statusText))))
      .then(parseSubtitles)
      .catch(() => {
        cache.delete(url);
        return [] as Cue[];
      });
    cache.set(url, p);
  }
  return p;
}

export function cueAt(cues: Cue[], t: number): string | null {
  for (const c of cues) {
    if (c.start > t) break;
    if (t <= c.end) return c.text;
  }
  return null;
}
