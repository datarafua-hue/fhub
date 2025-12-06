# 🚀 Деплой на Vercel

## Почему Vercel?

✅ **Более щедрые лимиты** для SSR проектов
✅ **Лучшая производительность** для Astro + React
✅ **Автоматический деплой** из GitHub
✅ **Бесплатный план** включает:
- 100 GB bandwidth
- 6,000 минут сборки/месяц
- 100 GB-Hours Serverless Functions
- Unlimited requests

## Что было сделано

1. ✅ Установлен `@astrojs/vercel` адаптер
2. ✅ Обновлен `astro.config.mjs` для Vercel
3. ✅ Создан `vercel.json` с конфигурацией
4. ✅ Создан `.vercelignore` для исключения ненужных файлов

## Инструкция по деплою

### Шаг 1: Зарегистрируйтесь на Vercel

1. Перейдите на [vercel.com](https://vercel.com)
2. Нажмите "Sign Up"
3. Выберите "Continue with GitHub"
4. Авторизуйтесь через GitHub

### Шаг 2: Импортируйте проект

1. На главной странице Vercel нажмите **"Add New..."** → **"Project"**
2. Найдите репозиторий `datarafua-hue/fhub`
3. Нажмите **"Import"**

### Шаг 3: Настройте проект

Vercel автоматически определит Astro! Но проверьте настройки:

#### Build & Development Settings:
- **Framework Preset:** Astro (определится автоматически)
- **Build Command:** `npm run build` (автоматически)
- **Output Directory:** `dist` (автоматически)
- **Install Command:** `npm install` (автоматически)

#### Environment Variables (если используете Supabase):

Добавьте переменные окружения:
```
PUBLIC_SUPABASE_URL=your_supabase_url
PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Шаг 4: Деплой!

1. Нажмите **"Deploy"**
2. Подождите 2-3 минуты пока проект собирается
3. После успешной сборки получите URL вашего сайта!

## Автоматический деплой

После первого деплоя каждый `git push` в ветку `main` автоматически:
1. Запустит сборку на Vercel
2. Задеплоит новую версию
3. Уведомит вас о статусе

## Преимущества Vercel над Netlify

| Функция | Netlify Free | Vercel Free |
|---------|--------------|-------------|
| Bandwidth | 100 GB | 100 GB |
| Build minutes | 300 | 6,000 ⭐ |
| Functions requests | 125K | Unlimited ⭐ |
| Functions execution | 125K | 100 GB-Hours ⭐ |
| Edge Functions | Limited | Included ⭐ |

## Мониторинг

После деплоя:
1. Откройте ваш проект в Vercel Dashboard
2. Перейдите в раздел **"Analytics"** - бесплатная аналитика!
3. Проверьте **"Functions"** - мониторинг serverless functions
4. Используйте **"Logs"** для отладки

## Дополнительные возможности

### Custom Domain
1. В Vercel Dashboard → **Settings** → **Domains**
2. Добавьте ваш домен
3. Настройте DNS записи (Vercel покажет инструкции)

### Preview Deployments
Каждый Pull Request автоматически создает preview deployment!

### Environment Variables по веткам
Можно настроить разные переменные для:
- Production (main ветка)
- Preview (pull requests)
- Development

## Troubleshooting

### Проблема: Build Failed
**Решение:** Проверьте логи сборки в Vercel Dashboard

### Проблема: 404 на страницах
**Решение:** Убедитесь что `output: 'server'` в `astro.config.mjs`

### Проблема: Supabase не работает
**Решение:** Проверьте Environment Variables в настройках проекта

## Полезные команды

```bash
# Локальная сборка (как на Vercel)
npm run build

# Локальный preview
npm run preview

# Установить Vercel CLI (опционально)
npm i -g vercel

# Деплой через CLI
vercel --prod
```

## Ссылки

- [Astro + Vercel Docs](https://docs.astro.build/en/guides/deploy/vercel/)
- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Dashboard](https://vercel.com/dashboard)

---

**Готово!** 🎉 Ваш сайт теперь на Vercel с лучшей производительностью и без проблем с лимитами!

