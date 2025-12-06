import type { APIRoute } from 'astro';
import { createServerSupabaseClient } from '../../../lib/supabase';

// LibreTranslate API configuration
const LIBRE_TRANSLATE_URL = 'https://libretranslate.com/translate';

// Language detection
const detectLanguage = (text: string): 'ru' | 'en' => {
  // Simple detection: check for Cyrillic characters
  const cyrillicPattern = /[а-яА-ЯёЁ]/;
  return cyrillicPattern.test(text) ? 'ru' : 'en';
};

// Translate using LibreTranslate
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

export const POST: APIRoute = async ({ request, cookies }) => {
  const accessToken = cookies.get('sb-access-token')?.value;
  const refreshToken = cookies.get('sb-refresh-token')?.value;
  const supabase = createServerSupabaseClient(accessToken, refreshToken);

  // Get request body
  const body = await request.json();
  const { commentId, targetLanguage } = body;

  if (!commentId || !targetLanguage) {
    return new Response(
      JSON.stringify({ error: 'commentId and targetLanguage are required' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // Validate target language
  if (!['ru', 'en'].includes(targetLanguage)) {
    return new Response(
      JSON.stringify({ error: 'Invalid target language. Must be ru or en' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    // Check if translation already exists in cache
    const { data: cachedTranslation } = await supabase
      .from('comment_translations')
      .select('translated_content')
      .eq('comment_id', commentId)
      .eq('target_language', targetLanguage)
      .single();

    if (cachedTranslation) {
      return new Response(
        JSON.stringify({
          translatedText: cachedTranslation.translated_content,
          fromCache: true,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Get original comment
    const { data: comment, error: commentError } = await supabase
      .from('comments')
      .select('content, original_language')
      .eq('id', commentId)
      .single();

    if (commentError || !comment) {
      return new Response(
        JSON.stringify({ error: 'Comment not found' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Check if already in target language
    if (comment.original_language === targetLanguage) {
      return new Response(
        JSON.stringify({
          translatedText: comment.content,
          isOriginal: true,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Translate using LibreTranslate
    const translatedText = await translateText(
      comment.content,
      comment.original_language || 'ru',
      targetLanguage
    );

    // Cache the translation
    const { error: cacheError } = await supabase
      .from('comment_translations')
      .insert({
        comment_id: commentId,
        target_language: targetLanguage,
        translated_content: translatedText,
      });

    if (cacheError) {
      console.error('Failed to cache translation:', cacheError);
      // Don't fail the request, just log it
    }

    return new Response(
      JSON.stringify({
        translatedText,
        fromCache: false,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Translation error:', error);
    return new Response(
      JSON.stringify({
        error: 'Translation service unavailable',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

