"use client";

import { createBrowserClient } from "@supabase/ssr";
import { createPublicSupabaseConfig } from "@repo/config/public";

export function createBrowserSupabaseClient() {
  const config = createPublicSupabaseConfig();

  return createBrowserClient(config.url, config.anonKey);
}
