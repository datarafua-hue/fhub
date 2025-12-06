import type { APIRoute } from 'astro';
import { createServerSupabaseClient } from '../../../lib/supabase';

export const GET: APIRoute = async ({ cookies }) => {
  const accessToken = cookies.get('sb-access-token')?.value;
  const refreshToken = cookies.get('sb-refresh-token')?.value;
  
  if (!accessToken) {
    return new Response(JSON.stringify({ user: null, profile: null }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
  
  const supabase = createServerSupabaseClient(accessToken, refreshToken);
  
  // Get user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    return new Response(JSON.stringify({ user: null, profile: null }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
  
  // Get profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
  
  return new Response(JSON.stringify({ 
    user: {
      id: user.id,
      email: user.email,
    },
    profile: profile || null,
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

