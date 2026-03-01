import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://zngduahebpsxqvaxdkzj.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpuZ2R1YWhlYnBzeHF2YXhka3pqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjI3OTc5MCwiZXhwIjoyMDg3ODU1NzkwfQ.auN-fZ0N7pEC7Dy40S0nUxh2mSnNsUlb8MvKIRDx_YU";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  global: {
    fetch: async (url, options) => {
      const MAX_RETRIES = 3;
      for (let i = 0; i < MAX_RETRIES; i++) {
        try {
          return await fetch(url, options);
        } catch (err) {
          if (i === MAX_RETRIES - 1) throw err;
          console.warn(`Supabase fetch failed, retrying... (${i + 1})`);
          await new Promise(r => setTimeout(r, 1000 * (i + 1))); // Exponential backoff
        }
      }
      return fetch(url, options);
    }
  }
});
