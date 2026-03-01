import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Converts a full Supabase storage URL to a local proxy URL to bypass CORS/network issues.
 */
export function getProxyUrl(originalUrl: string | null | undefined): string {
  if (!originalUrl) return "/placeholder.svg";
  return originalUrl;
}
