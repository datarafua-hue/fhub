# 🌍 Настройка переводов комментариев

## ✅ Текущая настройка: LibreTranslate (бесплатно)

Сейчас используется **LibreTranslate API** - бесплатный open-source сервис.

**Преимущества:**
- ✅ Полностью бесплатно
- ✅ Нет лимитов
- ✅ Не нужна регистрация

**Недостатки:**
- ⚠️ Качество перевода ниже чем у Google
- ⚠️ Медленнее работает
- ⚠️ Публичный API может быть недоступен

---

## 🚀 Переход на Google Translate API (рекомендуется)

YouTube использует именно Google Translate API. Вот как подключить:

### Шаг 1: Получить API ключ Google Cloud

1. Перейдите на [Google Cloud Console](https://console.cloud.google.com/)
2. Создайте новый проект (или выберите существующий)
3. Включите **Cloud Translation API**:
   - APIs & Services → Library
   - Найдите "Cloud Translation API"
   - Нажмите "Enable"
4. Создайте API ключ:
   - APIs & Services → Credentials
   - Create Credentials → API Key
   - Скопируйте ключ

### Шаг 2: Добавить переменную окружения

В Vercel Dashboard:
1. Откройте проект → Settings → Environment Variables
2. Добавьте переменную:
   ```
   GOOGLE_TRANSLATE_API_KEY=ваш_ключ_здесь
   ```
3. Сохраните

### Шаг 3: Обновить код

Откройте `src/pages/api/comments/translate.ts` и замените:

```typescript
// СТАРЫЙ КОД (LibreTranslate):
const LIBRE_TRANSLATE_URL = 'https://libretranslate.com/translate';

const translateText = async (
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<string> => {
  try {
    const response = await fetch(LIBRE_TRANSLATE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text,
        source: sourceLang,
        target: targetLang,
        format: 'text',
      }),
    });

    if (!response.ok) {
      throw new Error(`Translation API error: ${response.status}`);
    }

    const data = await response.json();
    return data.translatedText;
  } catch (error) {
    console.error('Translation error:', error);
    throw error;
  }
};
```

**НОВЫЙ КОД (Google Translate):**

```typescript
// Google Translate API configuration
const GOOGLE_TRANSLATE_API_KEY = import.meta.env.GOOGLE_TRANSLATE_API_KEY;
const GOOGLE_TRANSLATE_URL = 'https://translation.googleapis.com/language/translate/v2';

const translateText = async (
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<string> => {
  try {
    if (!GOOGLE_TRANSLATE_API_KEY) {
      throw new Error('Google Translate API key not configured');
    }

    const response = await fetch(
      `${GOOGLE_TRANSLATE_URL}?key=${GOOGLE_TRANSLATE_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text,
          source: sourceLang,
          target: targetLang,
          format: 'text',
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Translation API error: ${errorData.error?.message || response.status}`);
    }

    const data = await response.json();
    return data.data.translations[0].translatedText;
  } catch (error) {
    console.error('Translation error:', error);
    throw error;
  }
};
```

### Шаг 4: Задеплоить

```bash
git add .
git commit -m "Switch to Google Translate API"
git push
```

Vercel автоматически задеплоит изменения с новым API!

---

## 💰 Стоимость Google Translate API

- **Бесплатно:** первые 500,000 символов в месяц
- **После бесплатного лимита:** $20 за 1 миллион символов

**Пример:**
- Средний комментарий: 200 символов
- Бесплатный лимит: ~2,500 переводов в месяц
- Для сайта с умеренным трафиком это **полностью бесплатно**!

---

## 🔧 Как работает система

### 1. Автоопределение языка
При написании комментария определяется язык по наличию кириллицы:
```typescript
const cyrillicPattern = /[а-яА-ЯёЁ]/;
const isRussian = cyrillicPattern.test(text);
```

### 2. Единая ветка комментариев
Оба языковых файла (`1432.md` и `1432-en.md`) используют один `customSlug`:
```yaml
customSlug: "hidden-petli/ceam/1432"
```

Все комментарии сохраняются в одной таблице с полем `original_language`.

### 3. Кнопка перевода
Показывается только если язык комментария отличается от языка страницы:
- Русская страница → кнопка "Translate to Russian" для английских комментариев
- English page → button "Translate to English" for Russian comments

### 4. Кеширование
Переводы сохраняются в таблице `comment_translations`:
- Каждый перевод делается только один раз
- Повторные запросы берутся из кеша
- Экономия API запросов = экономия денег!

---

## 📊 SQL миграция уже выполнена

База данных уже настроена:
```sql
-- Поле для языка комментария
ALTER TABLE comments ADD COLUMN original_language VARCHAR(5) DEFAULT 'ru';

-- Таблица для кеша переводов
CREATE TABLE comment_translations (
  id UUID PRIMARY KEY,
  comment_id UUID REFERENCES comments(id),
  target_language VARCHAR(5),
  translated_content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(comment_id, target_language)
);
```

Если вы еще не выполнили миграцию в Supabase:
1. Откройте [Supabase Dashboard](https://supabase.com/dashboard)
2. SQL Editor
3. Скопируйте содержимое `supabase-migrations/04_add_comment_translations.sql`
4. Выполните запрос

---

## 🎯 Готово!

Теперь у вас:
- ✅ Единая ветка комментариев для всех языков
- ✅ Автоматический перевод по клику
- ✅ YouTube-подобный UX
- ✅ Кеширование переводов
- ✅ Готовность к переходу на Google Translate

**Текущий статус:** LibreTranslate (бесплатно, работает)  
**Планируется:** Google Translate API (лучшее качество)

