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
        brand: {
          50:  "#edf3ee",
          100: "#dce7de",
          200: "#c1d2c4",
          300: "#97b29b",
          400: "#6d8d72",
          500: "#4e6f54",
          600: "#3d5f44",
          700: "#375d3f",
          800: "#2f4f35",
          900: "#243d29",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
