import "server-only";

import { createClient } from "@supabase/supabase-js";
import { createServerConfig } from "@repo/config/server";

export function createServiceRoleSupabaseClient() {
  const config = createServerConfig();

  return createClient(config.supabase.url, config.supabase.serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false
    }
  });
}
