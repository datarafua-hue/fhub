import type { APIRoute } from 'astro';
import { createServerSupabaseClient } from '../../../lib/supabase';

export const POST: APIRoute = async ({ request, cookies }) => {
  const accessToken = cookies.get('sb-access-token')?.value;
  const refreshToken = cookies.get('sb-refresh-token')?.value;
  const supabase = createServerSupabaseClient(accessToken, refreshToken);

  // Check if user is admin
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (!profile?.is_admin) {
    return new Response(JSON.stringify({ error: 'Admin access required' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Get request body
  const body = await request.json();
  const { oldSlug, newSlug, checkOnly } = body;

  if (!oldSlug) {
    return new Response(JSON.stringify({ error: 'oldSlug is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Check only - count comments
  if (checkOnly) {
    const { count, error } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('post_slug', oldSlug);

    if (error) {
      console.error('Error counting comments:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ count: count || 0 }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Migrate comments
  if (!newSlug) {
    return new Response(JSON.stringify({ error: 'newSlug is required for migration' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (oldSlug === newSlug) {
    return new Response(JSON.stringify({ error: 'oldSlug and newSlug must be different' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Update all comments with the old slug to use the new slug
  const { data, error, count } = await supabase
    .from('comments')
    .update({ post_slug: newSlug })
    .eq('post_slug', oldSlug)
    .select('*', { count: 'exact' });

  if (error) {
    console.error('Error migrating comments:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(
    JSON.stringify({ 
      success: true,
      count: count || 0,
      message: `Successfully migrated ${count || 0} comments from "${oldSlug}" to "${newSlug}"`
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
};

