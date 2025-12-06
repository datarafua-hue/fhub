/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_SUPABASE_URL: string;
  readonly PUBLIC_SUPABASE_ANON_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare namespace App {
  interface Locals {
    user: {
      id: string;
      email?: string;
    } | null;
    profile: {
      id: string;
      username: string;
      full_name: string | null;
      avatar_url: string | null;
      is_admin: boolean;
      is_banned: boolean;
      created_at: string;
      updated_at: string;
    } | null;
  }
}
