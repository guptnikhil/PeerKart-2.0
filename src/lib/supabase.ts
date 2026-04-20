import { createClient } from "@supabase/supabase-js";

const isProd = import.meta.env.PROD;
const supabaseUrl = isProd 
  ? `${window.location.origin}/supabase` 
  : import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;


export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  global: {
    fetch: async (url, options) => {
      const MAX_RETRIES = 2;
      for (let i = 0; i < MAX_RETRIES; i++) {
        try {
          return await fetch(url, options);
        } catch (err) {
          if (i === MAX_RETRIES - 1) throw err;
          console.warn(`Supabase fetch failed, retrying... (${i + 1})`);
          await new Promise(r => setTimeout(r, 500 * (i + 1))); // Snappier backoff
        }
      }
      return fetch(url, options);
    }
  }
});
