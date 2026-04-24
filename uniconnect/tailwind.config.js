export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        neonBlue: "#60A5FA",
        neonPink: "#EC4899",
        darkBg: "#0F172A",
        cardBg: "#1E293B",
      },
      boxShadow: {
        glow: "0 0 20px rgba(236, 72, 153, 0.6)",
      },
    },
  },
  plugins: [],
};