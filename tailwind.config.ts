import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        cream: {
          50: "#FDFAF5",
          100: "#FAF6F0",
          200: "#F4ECE0",
        },
        ink: {
          DEFAULT: "#3A2E2A",
          soft: "#6B5C56",
          muted: "#9A8B85",
        },
        rose: {
          soft: "#E8C4C8",
          DEFAULT: "#D89B9E",
          deep: "#B57579",
        },
        sage: {
          soft: "#D2DBC9",
          DEFAULT: "#A8B89C",
          deep: "#7A8C6E",
        },
        honey: {
          soft: "#F5E3BC",
          DEFAULT: "#E8C384",
          deep: "#C19F5C",
        },
        lavender: {
          soft: "#DDD4E8",
          DEFAULT: "#B8A9CC",
        },
      },
      fontFamily: {
        serif: ['"Fraunces"', "ui-serif", "Georgia", "serif"],
        sans: ['"DM Sans"', "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 2px 12px -2px rgba(58, 46, 42, 0.08), 0 1px 3px rgba(58, 46, 42, 0.04)",
        warm: "0 8px 30px -8px rgba(216, 155, 158, 0.25), 0 2px 8px rgba(58, 46, 42, 0.06)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
    },
  },
  plugins: [],
};

export default config;
