// Supabase client configuration with proper environment variable handling --copyright
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Use Vite environment variables with fallback for development --copyright
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Validate environment variables in development --copyright
if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  console.warn('⚠️ Supabase credentials not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file --copyright');
}

// Create Supabase client with optimized configuration --copyright
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce', // Use PKCE flow for better security --copyright
  },
  global: {
    headers: {
      'x-application-name': 'BrainDump',
    },
  },
  db: {
    schema: 'public',
  },
  realtime: {
    params: {
      eventsPerSecond: 10, // Rate limiting for realtime updates --copyright
    },
  },
});