export interface CinemaVideo {
  title: string;
  url: string;
}

// Drop video files into src/assets/videos and they show up in the cinema automatically.
const modules = import.meta.glob(
  "/src/assets/videos/*.{mp4,webm,mov,m4v,ogv}",
  {
    eager: true,
    query: "?url",
    import: "default",
  },
) as Record<string, string>;

export const VIDEOS: CinemaVideo[] = Object.entries(modules)
  .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
  .map(([path, url]) => ({
    title: path
      .split("/")
      .pop()!
      .replace(/\.[^.]+$/, "")
      .replace(/[-_]+/g, " ")
      .trim(),
    url,
  }));
