import { useState } from 'react';
import { marked } from 'marked';
import DOMPurify from 'isomorphic-dompurify';
import type { CommentWithProfile } from '../../types/supabase';
import CommentForm from './CommentForm';

interface CommentItemProps {
  comment: CommentWithProfile;
  currentUserId?: string;
  isAdmin?: boolean;
  onReply: (comment: CommentWithProfile) => void;
  onUpdate: (comment: CommentWithProfile) => void;
  onDelete: (commentId: string) => void;
  depth?: number;
}

export default function CommentItem({
  comment,
  currentUserId,
  isAdmin = false,
  onReply,
  onUpdate,
  onDelete,
  depth = 0,
}: CommentItemProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showReplies, setShowReplies] = useState(true);

  const isOwner = currentUserId === comment.user_id;
  const canEdit = isOwner && new Date(comment.created_at) > new Date(Date.now() - 15 * 60 * 1000);
  const canDelete = isOwner || isAdmin;

  // Render Markdown safely
  const renderMarkdown = (content: string) => {
    const html = marked(content, { breaks: true });
    return DOMPurify.sanitize(html as string);
  };

  const handleDelete = async () => {
    if (!confirm('Вы уверены, что хотите удалить этот комментарий?')) {
      return;
    }

    try {
      const response = await fetch('/api/comments/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: comment.id }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Ошибка при удалении комментария');
      }

      onDelete(comment.id);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Произошла ошибка');
    }
  };

  const maxDepth = 5;
  const shouldNest = depth < maxDepth;

  return (
    <div className={`${depth > 0 ? 'ml-8 mt-4' : 'mt-4'} comment-item`}>
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {comment.profiles.avatar_url ? (
            <img
              src={comment.profiles.avatar_url}
              alt={comment.profiles.username}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-accent-blue flex items-center justify-center text-white font-medium">
              {comment.profiles.username[0].toUpperCase()}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-2">
            <span className="font-medium text-white">
              {comment.profiles.username}
            </span>
            {comment.profiles.is_admin && (
              <span className="px-2 py-0.5 bg-accent-blue text-white text-xs rounded-full">
                Автор
              </span>
            )}
            {!comment.is_approved && (
              <span className="px-2 py-0.5 bg-yellow-900 text-yellow-200 text-xs rounded-full">
                На модерации
              </span>
            )}
            <span className="text-sm text-gray-400">
              {new Date(comment.created_at).toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
            {comment.updated_at !== comment.created_at && (
              <span className="text-xs text-gray-500">
                (изменено)
              </span>
            )}
          </div>

          {/* Body */}
          {isEditing ? (
            <CommentForm
              postSlug={comment.post_slug}
              editingComment={comment}
              onCommentAdded={(updatedComment) => {
                onUpdate({ ...comment, ...updatedComment });
                setIsEditing(false);
              }}
              onCancel={() => setIsEditing(false)}
            />
          ) : (
            <>
              <div
                className="prose prose-invert prose-sm max-w-none text-gray-100"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(comment.content) }}
              />

              {/* Actions */}
              <div className="flex items-center gap-3 mt-3">
                {currentUserId && (
                  <button
                    onClick={() => setIsReplying(!isReplying)}
                    className="text-sm text-gray-400 hover:text-accent-blue transition-colors"
                  >
                    Ответить
                  </button>
                )}
                {canEdit && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-sm text-gray-400 hover:text-accent-blue transition-colors"
                  >
                    Редактировать
                  </button>
                )}
                {canDelete && (
                  <button
                    onClick={handleDelete}
                    className="text-sm text-gray-400 hover:text-red-400 transition-colors"
                  >
                    Удалить
                  </button>
                )}
                {comment.replies && comment.replies.length > 0 && (
                  <button
                    onClick={() => setShowReplies(!showReplies)}
                    className="text-sm text-gray-400 hover:text-accent-blue transition-colors"
                  >
                    {showReplies ? 'Скрыть' : 'Показать'} ответы ({comment.replies.length})
                  </button>
                )}
              </div>
            </>
          )}

          {/* Reply Form */}
          {isReplying && (
            <div className="mt-4">
              <CommentForm
                postSlug={comment.post_slug}
                parentId={comment.id}
                onCommentAdded={(newComment) => {
                  onReply({ ...newComment, profiles: comment.profiles, replies: [] } as CommentWithProfile);
                  setIsReplying(false);
                }}
                onCancel={() => setIsReplying(false)}
              />
            </div>
          )}

          {/* Nested Replies */}
          {showReplies && comment.replies && comment.replies.length > 0 && (
            <div className={shouldNest ? '' : 'border-l-2 border-gray-700 pl-4'}>
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  currentUserId={currentUserId}
                  isAdmin={isAdmin}
                  onReply={onReply}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                  depth={depth + 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

