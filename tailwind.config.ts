// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class", "html"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Your brand colors
        primary: {
          DEFAULT: "#FFAA00", // amber-500 equivalent
          foreground: "#000000",
        },
        background: {
          light: "#ffffff",
          dark: "#1a1a1a",
        },
        charcoal: "#121212",
        amber: {
          DEFAULT: "#FFAA00",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "sans-serif"],
        display: ["var(--font-sans)", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.5rem",
        large: "1rem",
      },
    },
  },
  plugins: [],
};
export default config;
