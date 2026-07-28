/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0b1220',
        ink2: '#101a2e',
        mist: '#8fa3c4',
        teal: '#2dd4bf',
        gold: '#f2b855',
        coral: '#f2726b'
      },
      fontFamily: {
        display: ['"Sora"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif']
      },
      backdropBlur: {
        xs: '2px'
      },
      boxShadow: {
        glass: '0 8px 32px rgba(0,0,0,0.35)',
        glow: '0 0 40px rgba(45,212,191,0.15)'
      }
    }
  },
  plugins: []
}
