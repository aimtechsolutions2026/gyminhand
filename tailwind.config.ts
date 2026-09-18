import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#0066FF", // Primary FitFlow Blue
          600: "#0052CC",
          700: "#003A99",
          800: "#1e40af",
          900: "#1e3a8a",
          DEFAULT: "#0066FF",
        },
        success: {
          DEFAULT: "#22C55E",
          50: "#f0fdf4",
          500: "#22C55E",
          600: "#16a34a",
          700: "#15803d",
        },
        warning: {
          DEFAULT: "#F59E0B",
          50: "#fffbeb",
          500: "#F59E0B",
          600: "#d97706",
          700: "#b45309",
        },
        danger: {
          DEFAULT: "#EF4444",
          50: "#fef2f2",
          500: "#EF4444",
          600: "#dc2626",
          700: "#b91c1c",
        },
        neutral: {
          50: "#F9FAFB",
          100: "#F3F4F6",
          200: "#E5E7EB",
          300: "#D1D5DB",
          400: "#9CA3AF",
          500: "#6B7280",
          600: "#4B5563",
          700: "#374151",
          800: "#1F2937",
          900: "#111827",
        },
      },
    },
  },
  plugins: [],
};

export default config;

