-- Add original_language field to comments table
ALTER TABLE comments 
ADD COLUMN IF NOT EXISTS original_language VARCHAR(5) DEFAULT 'ru';

-- Create comment_translations table for caching
CREATE TABLE IF NOT EXISTS comment_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  target_language VARCHAR(5) NOT NULL,
  translated_content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(comment_id, target_language)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_comment_translations_comment_id 
ON comment_translations(comment_id);

CREATE INDEX IF NOT EXISTS idx_comment_translations_language 
ON comment_translations(target_language);

-- Add RLS policies for comment_translations
ALTER TABLE comment_translations ENABLE ROW LEVEL SECURITY;

-- Anyone can read translations
CREATE POLICY "Anyone can read translations" 
ON comment_translations FOR SELECT 
USING (true);

-- Authenticated users can insert translations
CREATE POLICY "Authenticated users can insert translations" 
ON comment_translations FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- Comment: This migration adds:
-- 1. original_language field to track the language of each comment
-- 2. comment_translations table to cache translations
-- 3. Indexes for performance
-- 4. RLS policies for security

