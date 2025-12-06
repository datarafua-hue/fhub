// Environment configuration
// This file is used as a fallback if .env is not readable

export const env = {
  PUBLIC_SUPABASE_URL: process.env.PUBLIC_SUPABASE_URL || 'https://zwrblizxkmpspeecfgct.supabase.co',
  PUBLIC_SUPABASE_ANON_KEY: process.env.PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3cmJsaXp4a21wc3BlZWNmZ2N0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwMzUwNDcsImV4cCI6MjA4MDYxMTA0N30.SDtxjNMeocQOOYAZ2LqysRkM4L2Ly7v8_7saOAB7BQM'
};

