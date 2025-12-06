import { useState } from 'react';
import type { Comment } from '../../types/supabase';

interface CommentFormProps {
  postSlug: string;
  parentId?: string | null;
  onCommentAdded: (comment: Comment) => void;
  onCancel?: () => void;
  editingComment?: Comment | null;
}

export default function CommentForm({
  postSlug,
  parentId = null,
  onCommentAdded,
  onCancel,
  editingComment = null,
}: CommentFormProps) {
  const [content, setContent] = useState(editingComment?.content || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  // Auto-detect language based on content
  const detectLanguage = (text: string): 'ru' | 'en' => {
    // Check for Cyrillic characters
    const cyrillicPattern = /[а-яА-ЯёЁ]/;
    return cyrillicPattern.test(text) ? 'ru' : 'en';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!content.trim()) {
      setError('Комментарий не может быть пустым');
      return;
    }

    if (content.length > 5000) {
      setError('Комментарий слишком длинный (максимум 5000 символов)');
      return;
    }

    setIsSubmitting(true);

    try {
      // Detect language of the comment
      const detectedLanguage = detectLanguage(content);

      const url = editingComment ? '/api/comments/update' : '/api/comments/create';
      const response = await fetch(url, {
        method: editingComment ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...(editingComment && { id: editingComment.id }),
          post_slug: postSlug,
          parent_id: parentId,
          content,
          original_language: detectedLanguage,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка при отправке комментария');
      }

      onCommentAdded(data.comment);
      setContent('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-700">
        <button
          type="button"
          onClick={() => setShowPreview(false)}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            !showPreview
              ? 'border-accent-blue text-accent-blue'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          Редактировать
        </button>
        <button
          type="button"
          onClick={() => setShowPreview(true)}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            showPreview
              ? 'border-accent-blue text-accent-blue'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          Превью
        </button>
      </div>

      {/* Content */}
      {!showPreview ? (
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={parentId ? 'Написать ответ...' : 'Написать комментарий...'}
          className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-bg-dark text-white placeholder-gray-500 focus:ring-2 focus:ring-accent-blue focus:border-accent-blue resize-y min-h-[100px]"
          disabled={isSubmitting}
        />
      ) : (
        <div className="min-h-[100px] px-4 py-3 rounded-lg border border-gray-600 bg-bg-dark prose prose-invert max-w-none">
          {content ? (
            <div dangerouslySetInnerHTML={{ __html: content }} />
          ) : (
            <p className="text-gray-400">Ничего для предварительного просмотра</p>
          )}
        </div>
      )}

      {/* Markdown hint */}
      <div className="text-xs text-gray-400">
        Поддерживается Markdown: **жирный**, *курсив*, `код`, [ссылка](url)
      </div>

      {/* Error */}
      {error && (
        <div className="text-sm text-red-400 bg-red-900/20 p-3 rounded-lg border border-red-800">{error}</div>
      )}

      {/* Buttons */}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isSubmitting || !content.trim()}
          className="px-6 py-2 bg-accent-blue text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-accent-blue/20"
        >
          {isSubmitting
            ? 'Отправка...'
            : editingComment
            ? 'Обновить'
            : parentId
            ? 'Ответить'
            : 'Отправить'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Отмена
          </button>
        )}
      </div>
    </form>
  );
}

