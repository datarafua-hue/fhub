import { defineCollection, z } from 'astro:content';

const postsCollection = defineCollection({
	type: 'content',
	schema: z.object({
		title: z.string(),
		description: z.string(),
		seoTitle: z.string().optional(),
		seoDescription: z.string().optional(),
		tags: z.array(z.string()),
		vesden: z.union([z.number(), z.string()]).optional(),
		thickness: z.union([z.number(), z.string()]).optional(),
		category: z.string(), // основная категория (например, hidden-petli)
		subcategory: z.string().optional(), // подкатегория (например, koblenz)
		date: z.string(),
		author: z.string(),
		lang: z.enum(['ru', 'en']),
		brand: z.string().optional(), // бренд (например, AGB)
		images: z.array(z.union([
			z.string(), // поддержка старого формата (просто строка)
			z.object({
				url: z.string(), // путь к изображению
				caption: z.string().optional(), // описание изображения
			}),
		])).optional(), // массив изображений для слайдера с поддержкой описаний
		backgroundImage: z.string().optional(), // путь к фоновому изображению
		bgImagesPost: z.string().optional(), // путь к фоновому изображению для main (из папки public)
		faq: z.array(z.object({
			question: z.string(),
			answer: z.string(),
		})).optional(), // FAQ вопросы и ответы
		specs: z.object({
			version: z.string().optional(),
			developer: z.string().optional(),
			interfaceLanguage: z.string().optional(),
			activation: z.string().optional(),
			supportedDevices: z.string().optional(),
			architecture: z.string().optional(),
		}).optional(), // характеристики для правой колонки
		buyUrl: z.string().optional(), // ссылка на покупку
	}),
});

const categoriesCollection = defineCollection({
	type: 'content',
	schema: z.object({
		title: z.string(),
		description: z.string().optional(),
		seoTitle: z.string().optional(),
		seoDescription: z.string().optional(),
		lang: z.enum(['ru', 'en']),
		titleMenu: z.string().optional(), // Название для меню
		iconMenu: z.string().optional(), // Иконка (SVG path или эмоджи)
	}),
});

const brandsCollection = defineCollection({
	type: 'content',
	schema: z.object({
		title: z.string(),
		description: z.string(),
		descriptionSlidebar: z.string().optional(), // описание для сайдбара
		seoTitle: z.string().optional(),
		seoDescription: z.string().optional(),
		logo: z.string(), // путь к логотипу
		website: z.string().optional(), // ссылка на сайт бренда
		lang: z.enum(['ru', 'en']),
	}),
});

export const collections = {
	posts: postsCollection,
	categories: categoriesCollection,
	brand: brandsCollection,
};

