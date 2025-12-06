// TypeScript types for Supabase database schema

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          full_name: string | null
          avatar_url: string | null
          is_admin: boolean
          is_banned: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          full_name?: string | null
          avatar_url?: string | null
          is_admin?: boolean
          is_banned?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          full_name?: string | null
          avatar_url?: string | null
          is_admin?: boolean
          is_banned?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          post_slug: string
          user_id: string
          parent_id: string | null
          content: string
          original_language: string
          is_approved: boolean
          is_deleted: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          post_slug: string
          user_id: string
          parent_id?: string | null
          content: string
          original_language?: string
          is_approved?: boolean
          is_deleted?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          post_slug?: string
          user_id?: string
          parent_id?: string | null
          content?: string
          original_language?: string
          is_approved?: boolean
          is_deleted?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      comment_counts: {
        Row: {
          post_slug: string
          total_comments: number
          pending_comments: number
        }
      }
      user_comment_stats: {
        Row: {
          user_id: string
          total_comments: number
          approved_comments: number
          pending_comments: number
        }
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Helper types for easier use
export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export type Comment = Database['public']['Tables']['comments']['Row']
export type CommentInsert = Database['public']['Tables']['comments']['Insert']
export type CommentUpdate = Database['public']['Tables']['comments']['Update']

// Extended comment type with profile information
export interface CommentWithProfile extends Comment {
  profiles: Profile
  replies?: CommentWithProfile[]
}

// Auth types
export interface AuthUser {
  id: string
  email: string
  profile?: Profile
}

// API response types
export interface ApiResponse<T = any> {
  data?: T
  error?: string
}

export interface CommentsResponse {
  comments: CommentWithProfile[]
  total: number
}

export interface ProfileWithStats extends Profile {
  stats?: {
    total_comments: number
    approved_comments: number
    pending_comments: number
  }
}

