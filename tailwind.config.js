const { fontFamily } = require("tailwindcss/defaultTheme");

module.exports = {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", ...fontFamily.sans],
      },
      borderRadius: {
        DEFAULT: "8px",
        secondary: "4px",
        container: "12px",
      },
      boxShadow: {
        DEFAULT: "0 1px 4px rgba(0, 0, 0, 0.06)",
        hover: "0 2px 8px rgba(0, 0, 0, 0.08)",
        card: "0 2px 12px rgba(0, 0, 0, 0.06)",
        elevated: "0 4px 20px rgba(0, 0, 0, 0.08)",
      },
      colors: {
        peach: {
          50: "#FFF5F0",
          100: "#FEEEE6",
          200: "#FCD9C8",
          300: "#F6C6B6",
          400: "#E7B19F",
          500: "#CD8972",
          600: "#B87060",
          700: "#9A5A4C",
        },
        teal: {
          50: "#F0FAF9",
          100: "#D4F0ED",
          200: "#A8DDD8",
          300: "#88CCC5",
          400: "#6BB8B0",
          500: "#4FA39B",
          600: "#3D8880",
          700: "#2D6B65",
        },
        rose: {
          50: "#FFF6F2",
          100: "#FEEDE5",
          200: "#F4D2C4",
          300: "#E7B19F",
          400: "#D49A85",
          500: "#C0836E",
        },
        terracotta: {
          50: "#FBF0EB",
          100: "#F5DDD3",
          200: "#E4BAA8",
          300: "#CD8972",
          400: "#B87260",
          500: "#9A5C4D",
        },
        cream: {
          50: "#FFFCFA",
          100: "#FFF8F3",
          200: "#FFF1E8",
          300: "#FFE8DA",
        },
        sage: {
          50: "#F5F9F8",
          100: "#E8F2F0",
          200: "#D0E5E1",
          300: "#B3D4CE",
        },
      },
      spacing: {
        "form-field": "16px",
        section: "32px",
        "safe-bottom": "env(safe-area-inset-bottom, 0px)",
      },
    },
  },
  variants: {
    extend: {
      boxShadow: ["hover", "active"],
    },
  },
};
