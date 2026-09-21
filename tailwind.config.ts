import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#0f172a",
          accent: "#2563eb",
        },
        alerta: {
          desvio: "#dc2626",
        },
      },
    },
  },
  plugins: [],
};

export default config;
