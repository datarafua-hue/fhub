# 🚀 Деплой на Netlify

## Что было сделано

Проект настроен для деплоя на Netlify с поддержкой SSR (Server-Side Rendering).

### Изменения:

1. ✅ Установлен `@astrojs/netlify` адаптер
2. ✅ Обновлен `astro.config.mjs` для использования Netlify адаптера
3. ✅ Создан `netlify.toml` с правильной конфигурацией

## Настройки в Netlify Dashboard

### Build settings (уже настроены в netlify.toml):
- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **Functions directory:** `dist/functions`

### Environment Variables (если используете Supabase):

Добавьте в Netlify Dashboard → Site settings → Environment variables:

```bash
PUBLIC_SUPABASE_URL=your_supabase_url
PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Автоматический деплой

После каждого `git push` в ветку `main`, Netlify автоматически:
1. Скачает код из GitHub
2. Запустит `npm install`
3. Выполнит `npm run build`
4. Задеплоит сайт

## Проверка деплоя

1. Зайдите в Netlify Dashboard
2. Откройте ваш сайт
3. Перейдите в раздел **Deploys**
4. Дождитесь завершения сборки (обычно 2-3 минуты)
5. Откройте ваш сайт по URL от Netlify

## Возможные проблемы

### 404 Page Not Found
- ✅ Исправлено: установлен Netlify адаптер вместо Node.js адаптера
- ✅ Создан `netlify.toml` с правильными redirects

### Build Failed
- Проверьте логи сборки в Netlify Dashboard
- Убедитесь, что все зависимости установлены в `package.json`
- Проверьте переменные окружения

### Supabase не работает
- Добавьте environment variables в Netlify Dashboard
- Проверьте, что URL и ключи правильные

## Локальная проверка

Перед деплоем можно проверить сборку локально:

```bash
npm run build
npm run preview
```

## Структура после сборки

```
dist/
├── _astro/              # Клиентские ресурсы (CSS, JS)
├── functions/           # Netlify Functions для SSR
│   └── entry.mjs        # Основная функция Astro SSR
└── _redirects           # Правила редиректов
```

## Полезные ссылки

- [Astro + Netlify Docs](https://docs.astro.build/en/guides/deploy/netlify/)
- [Netlify Functions](https://docs.netlify.com/functions/overview/)
- [Netlify Environment Variables](https://docs.netlify.com/environment-variables/overview/)

