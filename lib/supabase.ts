import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const TABLES = {
  rsvp: "undangan_rsvp",
  wishes: "undangan_wishes",
} as const;

let client: SupabaseClient | null | undefined;

/**
 * Client Supabase dengan service role key (melewati RLS) — HANYA untuk server.
 * Mengembalikan null jika env belum diisi → aplikasi memakai mode demo (in-memory).
 */
export function getSupabaseAdmin(): SupabaseClient | null {
  if (client !== undefined) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  client =
    url && serviceKey
      ? createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })
      : null;
  return client;
}

export function isDemoMode() {
  return getSupabaseAdmin() === null;
}
