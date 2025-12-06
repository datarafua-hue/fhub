import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

// Supabase client for browser
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('placeholder')) {
  console.warn('⚠️ Supabase не настроен! Создайте файл .env с реальными ключами из https://supabase.com');
  console.warn('📖 Инструкции: см. SUPABASE_SETUP.md');
}

export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

// Helper function to get current user
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.error('Error getting current user:', error);
    return null;
  }
  return user;
}

// Helper function to get user profile
export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
  return data;
}

// Helper function to check if user is admin
export async function isUserAdmin(userId: string): Promise<boolean> {
  const profile = await getUserProfile(userId);
  return profile?.is_admin || false;
}

// Helper function to check if user is banned
export async function isUserBanned(userId: string): Promise<boolean> {
  const profile = await getUserProfile(userId);
  return profile?.is_banned || false;
}

// Sign up with email and password
export async function signUpWithEmail(email: string, password: string, username: string, fullName?: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
        full_name: fullName || '',
      },
    },
  });
  
  if (error) {
    console.error('Error signing up:', error);
    return { user: null, error };
  }
  
  return { user: data.user, error: null };
}

// Sign in with email and password
export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) {
    console.error('Error signing in:', error);
    return { user: null, error };
  }
  
  return { user: data.user, error: null };
}

// Sign in with magic link
export async function signInWithMagicLink(email: string) {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  
  if (error) {
    console.error('Error sending magic link:', error);
    return { error };
  }
  
  return { error: null };
}

// Sign in with Google OAuth
export async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  
  if (error) {
    console.error('Error signing in with Google:', error);
    return { error };
  }
  
  return { error: null };
}

// Sign out
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    console.error('Error signing out:', error);
    return { error };
  }
  
  return { error: null };
}

// Update user profile
export async function updateUserProfile(userId: string, updates: {
  username?: string;
  full_name?: string;
  avatar_url?: string;
}) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating profile:', error);
    return { profile: null, error };
  }
  
  return { profile: data, error: null };
}

// Upload avatar
export async function uploadAvatar(userId: string, file: File) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/${Date.now()}.${fileExt}`;
  
  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(fileName, file, {
      upsert: true,
    });
  
  if (error) {
    console.error('Error uploading avatar:', error);
    return { path: null, error };
  }
  
  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(data.path);
  
  return { path: publicUrl, error: null };
}

// Server-side Supabase client (for API routes)
export function createServerSupabaseClient(accessToken?: string, refreshToken?: string) {
  const url = import.meta.env.PUBLIC_SUPABASE_URL || supabaseUrl;
  const key = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || supabaseAnonKey;
  
  return createClient<Database>(
    url,
    key,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      global: {
        headers: accessToken
          ? {
              Authorization: `Bearer ${accessToken}`,
            }
          : {},
      },
    }
  );
}

