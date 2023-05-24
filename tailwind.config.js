/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors')

module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    colors: {
      ...colors,
      'light-gray': '#494b50',
      'dark-gray': '#34353a',
    },
    extend: {
      fontFamily: {
        montserrat: ['var(--font-montserrat)'],
        mulish: ['var(--font-mulish)'],
      },
    },
  },
  plugins: [],
}
