import { getCollection } from 'astro:content';
import fs from 'fs';
import path from 'path';

export interface MenuItem {
	name: string;
	slug: string;
	icon?: string; // SVG path или эмоджи
	children: MenuItem[];
}

/**
 * Генерирует структуру меню из папок categories
 */
export async function generateMenu(lang: 'ru' | 'en'): Promise<MenuItem[]> {
	const categoriesDir = path.join(process.cwd(), 'src/content/categories');
	const menuItems: MenuItem[] = [];

	try {
		// Получаем все категории из коллекции
		const allCategories = await getCollection('categories', ({ data }) => 
			data.lang === lang
		);

		// Читаем структуру папок
		const categoryFolders = fs.readdirSync(categoriesDir, { withFileTypes: true })
			.filter(entry => entry.isDirectory())
			.map(entry => entry.name);

		// Для каждой категории строим меню
		for (const categoryFolder of categoryFolders) {
			const categoryPath = path.join(categoriesDir, categoryFolder);
			
			// Ищем index файл для этой категории
			// ID может быть в формате: "hidden-petli/index" или "hidden-petli/index.md" или "hidden-petli/index.en.md"
			const categoryData = allCategories.find(cat => {
				// Проверяем, что ID начинается с названия папки и содержит index
				if (!cat.id.startsWith(`${categoryFolder}/`)) return false;
				
				// Для ru языка ищем index.md или index
				if (lang === 'ru') {
					return cat.id === `${categoryFolder}/index` || 
					       cat.id === `${categoryFolder}/index.md` ||
					       cat.id.startsWith(`${categoryFolder}/index`) && !cat.id.includes('.en.');
				}
				// Для en языка ищем index.en.md
				else {
					return cat.id === `${categoryFolder}/index.en.md` ||
					       cat.id.includes(`${categoryFolder}/index.en`);
				}
			});

			if (!categoryData) continue;

			// Получаем название для меню (titleMenu или title)
			const menuName = categoryData.data.titleMenu || categoryData.data.title;
			const menuIcon = categoryData.data.iconMenu;

			// Получаем подкатегории
			const subcategories: MenuItem[] = [];
			const subcategoryFolders = fs.readdirSync(categoryPath, { withFileTypes: true })
				.filter(entry => entry.isDirectory())
				.map(entry => entry.name);

			for (const subcategoryFolder of subcategoryFolders) {
				// Ищем index файл для подкатегории
				const subcategoryData = allCategories.find(cat => {
					// Проверяем, что ID начинается с пути категории/подкатегории и содержит index
					if (!cat.id.startsWith(`${categoryFolder}/${subcategoryFolder}/`)) return false;
					
					// Для ru языка ищем index.md или index
					if (lang === 'ru') {
						return cat.id === `${categoryFolder}/${subcategoryFolder}/index` ||
						       cat.id === `${categoryFolder}/${subcategoryFolder}/index.md` ||
						       (cat.id.startsWith(`${categoryFolder}/${subcategoryFolder}/index`) && !cat.id.includes('.en.'));
					}
					// Для en языка ищем index.en.md
					else {
						return cat.id === `${categoryFolder}/${subcategoryFolder}/index.en.md` ||
						       cat.id.includes(`${categoryFolder}/${subcategoryFolder}/index.en`);
					}
				});

				if (subcategoryData) {
					const subMenuName = subcategoryData.data.titleMenu || subcategoryData.data.title;
					subcategories.push({
						name: subMenuName,
						slug: subcategoryFolder,
						icon: subcategoryData.data.iconMenu,
						children: [],
					});
				}
			}

			menuItems.push({
				name: menuName,
				slug: categoryFolder,
				icon: menuIcon,
				children: subcategories,
			});
		}
	} catch (error) {
		console.error('Error generating menu:', error);
	}

	return menuItems;
}

