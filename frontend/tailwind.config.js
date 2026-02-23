/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // muy importante
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Aquí podrías añadir personalizaciones de colores si quisieras
      // pero con los colores por defecto de Tailwind (slate, blue, orange)
      // el dashboard ya se verá profesional.
    },
  },
  plugins: [],
}