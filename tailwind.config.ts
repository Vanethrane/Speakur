import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#1c1712",
          muted: "#5c5348",
        },
        paper: {
          DEFAULT: "#f6f1e8",
          raised: "#fffaf3",
          line: "#e4d9c8",
        },
        voice: {
          DEFAULT: "#0d6e66",
          dark: "#0a524c",
          glow: "#e8f4f2",
        },
      },
      fontFamily: {
        display: ["Fraunces", "Georgia", "serif"],
        sans: ["Outfit", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 18px 40px -28px rgba(28, 23, 18, 0.45)",
      },
    },
  },
  plugins: [],
};

export default config;
