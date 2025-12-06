import { useEffect, useState } from 'react';
import type { CommentWithProfile } from '../../types/supabase';
import CommentForm from './CommentForm';
import CommentItem from './CommentItem';
import { supabase } from '../../lib/supabase';

interface CommentSectionProps {
  postSlug: string;
  currentUserId?: string;
  isAdmin?: boolean;
}

export default function CommentSection({
  postSlug,
  currentUserId,
  isAdmin = false,
}: CommentSectionProps) {
  const [comments, setComments] = useState<CommentWithProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Build tree structure from flat comments
  const buildCommentTree = (flatComments: CommentWithProfile[]): CommentWithProfile[] => {
    const commentMap = new Map<string, CommentWithProfile>();
    const rootComments: CommentWithProfile[] = [];

    // Initialize all comments with empty replies array
    flatComments.forEach((comment) => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });

    // Build the tree
    flatComments.forEach((comment) => {
      const commentWithReplies = commentMap.get(comment.id)!;
      
      if (comment.parent_id) {
        const parent = commentMap.get(comment.parent_id);
        if (parent) {
          parent.replies = parent.replies || [];
          parent.replies.push(commentWithReplies);
        }
      } else {
        rootComments.push(commentWithReplies);
      }
    });

    return rootComments;
  };

  // Fetch comments
  const fetchComments = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/comments/${encodeURIComponent(postSlug)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка при загрузке комментариев');
      }

      const tree = buildCommentTree(data.comments || []);
      setComments(tree);
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`comments:${postSlug}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `post_slug=eq.${postSlug}`,
        },
        () => {
          // Refetch comments on any change
          fetchComments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postSlug]);

  const handleCommentAdded = (newComment: CommentWithProfile) => {
    // Refresh comments to get the full tree with profile data
    fetchComments();
  };

  const handleCommentUpdate = (updatedComment: CommentWithProfile) => {
    fetchComments();
  };

  const handleCommentDelete = (commentId: string) => {
    fetchComments();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-blue"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-2xl font-bold text-white">
          Комментарии {comments.length > 0 && `(${comments.length})`}
        </h2>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-900/20 text-red-400 rounded-lg border border-red-800">
          {error}
        </div>
      )}

      {/* Comment Form */}
      {currentUserId ? (
        <div className="bg-bg-block rounded-xl shadow-lg p-6 border border-gray-700">
          <CommentForm
            postSlug={postSlug}
            onCommentAdded={handleCommentAdded}
          />
        </div>
      ) : (
        <div className="bg-bg-block rounded-xl p-6 text-center border border-gray-700">
          <p className="text-gray-400 mb-4">
            Войдите, чтобы оставить комментарий
          </p>
          <button
            onClick={() => {
              window.dispatchEvent(new CustomEvent('open-auth-modal'));
            }}
            className="px-6 py-2 bg-accent-blue text-white rounded-lg hover:bg-blue-600 transition-colors shadow-lg shadow-accent-blue/20"
          >
            Войти
          </button>
        </div>
      )}

      {/* Comments List */}
      {comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-bg-block rounded-xl shadow-lg p-6 border border-gray-700"
            >
              <CommentItem
                comment={comment}
                currentUserId={currentUserId}
                isAdmin={isAdmin}
                onReply={handleCommentAdded}
                onUpdate={handleCommentUpdate}
                onDelete={handleCommentDelete}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-400 bg-bg-block rounded-xl border border-gray-700">
          Пока нет комментариев. Будьте первым!
        </div>
      )}
    </div>
  );
}

