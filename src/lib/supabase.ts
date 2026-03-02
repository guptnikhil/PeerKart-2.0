import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://white-block-25e5.guptnikhil996.workers.dev"; // Cloudflare proxy → bypasses ISP block
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpuZ2R1YWhlYnBzeHF2YXhka3pqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyNzk3OTAsImV4cCI6MjA4Nzg1NTc5MH0.L1PTfn7rd67zwOCMOcNZjf8RFbygObwddrwEgrQaGag";


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
