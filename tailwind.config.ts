import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        drawsports: {
          primary: "#FF1744",
          "primary-hover": "#ff4569",
          "bg-dark": "#1a0f0f",
          "bg-card": "#2a1f1f",
          "text-muted": "#a0a0a0",
        },
      },
      boxShadow: {
        "drawsports-glow": "0 4px 15px rgba(255, 23, 68, 0.4)",
        "drawsports-card": "0 8px 30px rgba(0, 0, 0, 0.3)",
      },
    },
  },
  plugins: [],
};

export default config;
