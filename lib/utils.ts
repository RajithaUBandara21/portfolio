import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const DEFAULT_DATE_FORMAT: Intl.DateTimeFormatOptions = {
  month: "long",
  day: "numeric",
  year: "numeric",
};

// Data read through `unstable_cache` round-trips through JSON on a cache hit, so `Date` fields
// come back as ISO strings rather than `Date` instances (only a fresh, uncached compute returns
// the original `Date`). Always go through this helper for cached data instead of calling
// `.toLocaleDateString()` directly, which throws once the value is a string.
export function formatDate(
  date: Date | string | null | undefined,
  options: Intl.DateTimeFormatOptions = DEFAULT_DATE_FORMAT,
): string {
  if (!date) return "";
  const value = date instanceof Date ? date : new Date(date);
  return value.toLocaleDateString("en-US", options);
}
