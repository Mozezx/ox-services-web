import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://rdfgphlxfwbheluwoyek.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkZmdwaGx4ZndiaGVsdXdveWVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwNDAzMzIsImV4cCI6MjA4MjYxNjMzMn0.CazBdQ-nBSZu3y-Uh_RyvoMB9b_zvatMEaXMO5j0RWw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
