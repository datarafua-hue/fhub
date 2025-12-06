import { ru } from './ru';
import { en } from './en';

export const translations = {
	ru,
	en,
} as const;

export type Locale = keyof typeof translations;
export type Translation = typeof ru;

export function getTranslations(locale: Locale): Translation {
	return translations[locale] || translations.ru;
}

