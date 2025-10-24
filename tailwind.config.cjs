/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class', // use the .dark class on <html> to toggle dark mode
    content: [
        './app/**/*.{js,ts,jsx,tsx}',
        './components/**/*.{js,ts,jsx,tsx}',
        './pages/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
        extend: {
        colors: {
            'brand-blue': 'var(--brand-blue)'
        }
        },
    },
    plugins: [],
};
