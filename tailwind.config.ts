import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-jakarta-sans)", "ui-sans-serif", "system-ui"],
      },
      colors: {
        "main-purple": "#635FC7",
        "main-purple-light": "#A8A4FF",
        black: "#000112",
        "very-dark-gray": "#20212C",
        "dark-gray": "#2B2C37",
        "lines-dark": "#3E3F4E",
        "lines-light": "#E4EBFA",
        "medium-gray": "#828FA3",
        "light-gray": "#F4F7FD",
        red: "#EA5555",
        "red-hover": "#FF9898",
      },
    },
  },
  plugins: [],
} satisfies Config;
