import type { APIRoute } from 'astro';
import { createServerSupabaseClient } from '../../../lib/supabase';

export const POST: APIRoute = async ({ request, cookies }) => {
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

  // Get user profile to check if banned or admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_banned, is_admin')
    .eq('id', user.id)
    .single();

  if (profile?.is_banned) {
    return new Response(JSON.stringify({ error: 'You are banned from commenting' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Parse request body
  const body = await request.json();
  const { post_slug, parent_id, content, original_language } = body;

  if (!post_slug || !content) {
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

  // Create comment
  const { data: comment, error } = await supabase
    .from('comments')
    .insert({
      post_slug,
      user_id: user.id,
      parent_id: parent_id || null,
      content,
      original_language: original_language || 'ru', // Default to Russian if not provided
      is_approved: profile?.is_admin || false, // Admins auto-approved, others need moderation
    })
    .select('*, profiles(*)')
    .single();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ comment }), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  });
};

