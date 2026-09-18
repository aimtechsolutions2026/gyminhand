import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string): string {
  const numericAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(numericAmount);
}

export function generateMemberId(prefix: string, branchName: string, count: number): string {
  const cleanPrefix = prefix.replace(/[^A-Z0-9]/gi, "").toUpperCase().slice(0, 4) || "GYM";
  const cleanBranch = branchName.replace(/[^A-Z0-9]/gi, "").toUpperCase().slice(0, 3) || "HQ";
  const paddedCount = String(count + 1).padStart(6, "0");
  return `${cleanPrefix}-${cleanBranch}-${paddedCount}`;
}

