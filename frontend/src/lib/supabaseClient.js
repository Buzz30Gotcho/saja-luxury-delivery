import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('[SupabaseClient] Initialisation...');
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('[SupabaseClient] ❌ Variables d\'environnement manquantes !');
} else {
  console.log('[SupabaseClient] ✅ Variables détectées');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});
