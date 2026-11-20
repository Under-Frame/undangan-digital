import "server-only";

import { randomUUID } from "node:crypto";

import type { Attendance, Wish } from "@/lib/schemas";
import { getSupabaseAdmin, TABLES } from "@/lib/supabase";

/**
 * Lapisan data RSVP & ucapan.
 * Supabase jika env terisi; jika tidak, penyimpanan in-memory (mode demo).
 */

export type NewRsvp = { slug: string; name: string; attendance: Attendance; guestCount: number };
export type NewWish = { slug: string; name: string; message: string };

export type RsvpRecord = NewRsvp & { id: string; createdAt: string };
type WishRecord = Wish & { slug: string; hidden: boolean };

/* ------------------------------ in-memory ------------------------------ */

type MemoryDb = { rsvp: RsvpRecord[]; wishes: WishRecord[] };

// Simpan di globalThis agar tidak hilang saat hot reload di mode dev.
const globalForDb = globalThis as unknown as { __undanganDb?: MemoryDb };
const memory: MemoryDb = (globalForDb.__undanganDb ??= { rsvp: [], wishes: [] });

/* -------------------------------- API ---------------------------------- */

export async function addRsvp(input: NewRsvp): Promise<void> {
  const db = getSupabaseAdmin();
  if (!db) {
    memory.rsvp.unshift({ ...input, id: randomUUID(), createdAt: new Date().toISOString() });
    return;
  }
  const { error } = await db.from(TABLES.rsvp).insert({
    wedding_slug: input.slug,
    guest_name: input.name,
    attendance: input.attendance,
    guest_count: input.guestCount,
  });
  if (error) throw new Error(`Gagal menyimpan RSVP: ${error.message}`);
}

export async function addWish(input: NewWish): Promise<Wish> {
  const db = getSupabaseAdmin();
  if (!db) {
    const wish: WishRecord = {
      id: randomUUID(),
      slug: input.slug,
      name: input.name,
      message: input.message,
      createdAt: new Date().toISOString(),
      hidden: false,
    };
    memory.wishes.unshift(wish);
    return toWish(wish);
  }
  const { data, error } = await db
    .from(TABLES.wishes)
    .insert({ wedding_slug: input.slug, guest_name: input.name, message: input.message })
    .select("id, guest_name, message, created_at")
    .single();
  if (error) throw new Error(`Gagal menyimpan ucapan: ${error.message}`);
  return { id: data.id, name: data.guest_name, message: data.message, createdAt: data.created_at };
}

/** Ucapan yang tidak disembunyikan, terbaru di atas. */
export async function listWishes(slug: string, offset: number, limit: number) {
  const db = getSupabaseAdmin();
  if (!db) {
    const visible = memory.wishes.filter((w) => w.slug === slug && !w.hidden);
    return { items: visible.slice(offset, offset + limit).map(toWish), hasMore: visible.length > offset + limit };
  }
  // Ambil satu lebih banyak untuk tahu apakah masih ada halaman berikutnya.
  const { data, error } = await db
    .from(TABLES.wishes)
    .select("id, guest_name, message, created_at")
    .eq("wedding_slug", slug)
    .eq("is_hidden", false)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit);
  if (error) throw new Error(`Gagal memuat ucapan: ${error.message}`);
  const rows = data ?? [];
  return {
    items: rows.slice(0, limit).map((r) => ({ id: r.id, name: r.guest_name, message: r.message, createdAt: r.created_at })),
    hasMore: rows.length > limit,
  };
}

function toWish({ id, name, message, createdAt }: WishRecord): Wish {
  return { id, name, message, createdAt };
}
