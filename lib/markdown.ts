import readingTime from "reading-time";

export function calculateReadingTimeMinutes(mdxContent: string): number {
  return Math.max(1, Math.ceil(readingTime(mdxContent).minutes));
}
