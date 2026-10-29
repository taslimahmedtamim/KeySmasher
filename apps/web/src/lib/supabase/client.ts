import { createBrowserClient } from '@supabase/ssr';
import { Database } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  return (
    Boolean(supabaseUrl) &&
    Boolean(supabaseAnonKey) &&
    !supabaseUrl.includes('your-project-id') &&
    !supabaseAnonKey.includes('your-supabase-anon-key')
  );
};

let browserClient: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function getSupabaseClient() {
  if (browserClient) return browserClient;

  if (isSupabaseConfigured()) {
    browserClient = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
    return browserClient;
  }

  // Fallback stub client when offline or credentials unconfigured
  return null;
}
