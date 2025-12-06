import { defineMiddleware } from 'astro:middleware';
import { createServerSupabaseClient } from './lib/supabase';

export const onRequest = defineMiddleware(async ({ cookies, locals, url, redirect }, next) => {
  const accessToken = cookies.get('sb-access-token')?.value;
  const refreshToken = cookies.get('sb-refresh-token')?.value;
  
  // Initialize locals
  locals.user = null;
  locals.profile = null;
  
  // Handle i18n redirects: / -> keep as ru (default), /en/* -> en locale
  // Root path stays as Russian (default locale)
  if (url.pathname === '/' || url.pathname.startsWith('/ru')) {
    // Russian is the default, no redirect needed
  } else if (!url.pathname.startsWith('/en') && !url.pathname.startsWith('/api') && !url.pathname.startsWith('/admin') && !url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf)$/)) {
    // For routes without lang prefix (except API, admin, static files), they are treated as ru (default)
  }
  
  if (accessToken) {
    const supabase = createServerSupabaseClient(accessToken, refreshToken);
    
    // Get user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (user && !userError) {
      locals.user = user;
      
      // Get profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profile) {
        locals.profile = profile;
      }
    }
  }
  
  // Protect admin routes
  if (url.pathname.includes('/admin/')) {
    if (!locals.user || !locals.profile?.is_admin) {
      return new Response('Unauthorized', { status: 401 });
    }
  }
  
  return next();
});

