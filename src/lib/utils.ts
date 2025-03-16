import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount / 100);
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w-]+/g, "") // Remove all non-word characters
    .replace(/--+/g, "-"); // Replace multiple - with single -
}

/**
 * Gets the initials from a name string
 * @param name Full name string
 * @returns First letter of first name and first letter of last name (if available)
 * @example
 * getInitials("John Doe") // returns "JD"
 * getInitials("John") // returns "J"
 * getInitials("") // returns ""
 */
export function getInitials(name?: string | null): string {
  if (!name) return "";

  const names = name.trim().split(" ").filter(Boolean);
  if (names.length === 0) return "";

  if (names.length === 1) {
    return names[0]?.charAt(0)?.toUpperCase() ?? "";
  }

  return (
    (names[0]?.charAt(0)?.toUpperCase() ?? "") +
    (names[names.length - 1]?.charAt(0)?.toUpperCase() ?? "")
  );
}
