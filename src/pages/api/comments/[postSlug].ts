import type { APIRoute } from 'astro';
import { createServerSupabaseClient } from '../../../lib/supabase';

export const GET: APIRoute = async ({ params, cookies }) => {
  const { postSlug } = params;
  
  if (!postSlug) {
    return new Response(JSON.stringify({ error: 'Post slug is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Decode URL-encoded slug (e.g., hidden-petli%2Fceam%2Fpost-1-ru -> hidden-petli/ceam/post-1-ru)
  const decodedPostSlug = decodeURIComponent(postSlug);

  const accessToken = cookies.get('sb-access-token')?.value;
  const refreshToken = cookies.get('sb-refresh-token')?.value;
  const supabase = createServerSupabaseClient(accessToken, refreshToken);

  // Get current user to check if they're an admin
  const { data: { user } } = await supabase.auth.getUser();
  let isAdmin = false;

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();
    
    isAdmin = profile?.is_admin || false;
  }

  // Fetch comments with profiles
  let query = supabase
    .from('comments')
    .select('*, profiles(*)')
    .eq('post_slug', decodedPostSlug)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false });

  // Non-admins only see approved comments or their own
  if (!isAdmin) {
    if (user) {
      query = query.or(`is_approved.eq.true,user_id.eq.${user.id}`);
    } else {
      query = query.eq('is_approved', true);
    }
  }

  const { data: comments, error } = await query;

  if (error) {
    console.error('Error fetching comments:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ comments: comments || [] }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

