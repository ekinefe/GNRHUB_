import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!supabaseConfigured) {
    console.warn('Supabase env vars are empty; sign-in is unavailable.');
}

// createClient throws on an empty URL, which blanks the whole app. Fall back to
// placeholders so the public site still renders; auth calls just fail.
export const supabase = createClient(
    supabaseUrl || 'http://localhost:54321',
    supabaseAnonKey || 'missing-anon-key'
);
