// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#FFF4EF",
          100: "#FFE6DA",
          200: "#FFC9B0",
          300: "#FFA983",
          400: "#FF8F60",
          500: "#FF7A45",   // əsas
          600: "#F2611F",
          700: "#C94A14",
          800: "#9C3A11",
          900: "#7A2F10",
        },
        teal: {
          50:  "#EFFCFB",
          100: "#D3F6F4",
          200: "#A8ECE9",
          300: "#6FDDD9",
          400: "#33C6C3",
          500: "#0EA5A4",   // aksent
          600: "#0C8584",
          700: "#0D6968",
          800: "#0F5455",
          900: "#114647",
        },
        cream: "#FFFBF7",
        ink: {
          DEFAULT: "#1E293B",
          light: "#475569",
          muted: "#94A3B8",
        },
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', "system-ui", "sans-serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 2px 12px rgba(30, 41, 59, 0.06)",
        card: "0 4px 20px rgba(30, 41, 59, 0.08)",
        hover: "0 12px 32px rgba(255, 122, 69, 0.18)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: 0, transform: "translateY(8px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: 0, transform: "scale(.96)" },
          "100%": { opacity: 1, transform: "scale(1)" },
        },
      },
      animation: {
        fadeIn: "fadeIn .35s ease-out",
        scaleIn: "scaleIn .2s ease-out",
      },
    },
  },
  plugins: [],
};