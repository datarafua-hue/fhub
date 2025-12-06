/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	darkMode: 'class',
	theme: {
		extend: {
			fontFamily: {
				sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', 'Arial', 'sans-serif'],
			},
			colors: {
				'dark': '#1e1e1e',
				'block': '#252525',
				'accent-blue': '#007AFF',
				'glass': 'rgba(255, 255, 255, 0.05)',
				'glass-border': 'rgba(255, 255, 255, 0.1)',
			},
			borderRadius: {
				'xl': '0.75rem',
				'2xl': '1rem',
				'3xl': '1.5rem',
			},
			backdropBlur: {
				'xs': '2px',
				'glass': '20px',
				'strong': '40px',
			},
			boxShadow: {
				'glow': '0 0 20px rgba(0, 122, 255, 0.3)',
				'glow-lg': '0 0 40px rgba(0, 122, 255, 0.4)',
				'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
				'glass-lg': '0 12px 48px 0 rgba(0, 0, 0, 0.5)',
			},
		},
	},
	plugins: [],
}

