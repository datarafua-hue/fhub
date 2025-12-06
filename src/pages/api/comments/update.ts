import type { APIRoute } from 'astro';
import { createServerSupabaseClient } from '../../../lib/supabase';

export const PATCH: APIRoute = async ({ request, cookies }) => {
  const accessToken = cookies.get('sb-access-token')?.value;
  const refreshToken = cookies.get('sb-refresh-token')?.value;

  if (!accessToken) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const supabase = createServerSupabaseClient(accessToken, refreshToken);

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Parse request body
  const body = await request.json();
  const { id, content, original_language } = body;

  if (!id || !content) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (content.length > 5000) {
    return new Response(JSON.stringify({ error: 'Comment too long' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Get comment to check ownership and time
  const { data: existingComment } = await supabase
    .from('comments')
    .select('*')
    .eq('id', id)
    .single();

  if (!existingComment) {
    return new Response(JSON.stringify({ error: 'Comment not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Check if user owns the comment
  if (existingComment.user_id !== user.id) {
    return new Response(JSON.stringify({ error: 'You can only edit your own comments' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Check if comment is within edit time (15 minutes)
  const commentAge = Date.now() - new Date(existingComment.created_at).getTime();
  const fifteenMinutes = 15 * 60 * 1000;

  if (commentAge > fifteenMinutes) {
    return new Response(JSON.stringify({ error: 'Comment can only be edited within 15 minutes' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Update comment
  const { data: comment, error } = await supabase
    .from('comments')
    .update({ content })
    .eq('id', id)
    .select('*, profiles(*)')
    .single();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ comment }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

