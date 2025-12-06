// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
	output: 'server', // Server-side rendering for auth, comments, and i18n
	adapter: node({
		mode: 'standalone'
	}),
	integrations: [tailwind(), react()],
	i18n: {
		locales: ['ru', 'en'],
		defaultLocale: 'ru',
		routing: {
			prefixDefaultLocale: false, // ru без префикса, en с префиксом /en
			redirectToDefaultLocale: false, // не редиректить / на /ru
		},
	},
});
