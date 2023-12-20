import withMT from '@material-tailwind/react/utils/withMT'

export default withMT({
  content: ['./src/client/**/*.{js,ts,jsx,tsx,mdx}', './src/app/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        gray: {
          950: '#030712',
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
})
