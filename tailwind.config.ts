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
          primary: "#b81e24",
          "primary-hover": "#d42830",
          "bg-dark": "#0c0d10",
          "bg-card": "#14161c",
          "bg-elevated": "#1a1d26",
          "text-muted": "#a1a1aa",
        },
      },
      boxShadow: {
        "drawsports-glow": "0 4px 15px rgba(184, 30, 36, 0.25)",
        "drawsports-card": "0 8px 30px rgba(0, 0, 0, 0.35)",
      },
      borderRadius: {
        btn: "10px",
      },
    },
  },
  plugins: [],
};

export default config;
