import "server-only";

import { randomUUID } from "node:crypto";

import type { AdminWish, Attendance, Wish } from "@/lib/schemas";
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

/* ------------------------------ admin ---------------------------------- */

const ADMIN_LIMIT = 5000;

/** Semua RSVP satu undangan, terbaru di atas. Hanya untuk dashboard admin. */
export async function listRsvp(slug: string): Promise<RsvpRecord[]> {
  const db = getSupabaseAdmin();
  if (!db) return memory.rsvp.filter((r) => r.slug === slug);
  const { data, error } = await db
    .from(TABLES.rsvp)
    .select("id, guest_name, attendance, guest_count, created_at")
    .eq("wedding_slug", slug)
    .order("created_at", { ascending: false })
    .limit(ADMIN_LIMIT);
  if (error) throw new Error(`Gagal memuat RSVP: ${error.message}`);
  return (data ?? []).map((r) => ({
    id: r.id,
    slug,
    name: r.guest_name,
    attendance: r.attendance,
    guestCount: r.guest_count,
    createdAt: r.created_at,
  }));
}

/** Semua ucapan termasuk yang disembunyikan. Hanya untuk dashboard admin. */
export async function listAllWishes(slug: string): Promise<AdminWish[]> {
  const db = getSupabaseAdmin();
  if (!db) return memory.wishes.filter((w) => w.slug === slug).map((w) => ({ ...toWish(w), hidden: w.hidden }));
  const { data, error } = await db
    .from(TABLES.wishes)
    .select("id, guest_name, message, is_hidden, created_at")
    .eq("wedding_slug", slug)
    .order("created_at", { ascending: false })
    .limit(ADMIN_LIMIT);
  if (error) throw new Error(`Gagal memuat ucapan: ${error.message}`);
  return (data ?? []).map((r) => ({
    id: r.id,
    name: r.guest_name,
    message: r.message,
    createdAt: r.created_at,
    hidden: r.is_hidden,
  }));
}

/** Sembunyikan/tampilkan ucapan. Mengembalikan false jika ucapan tidak ditemukan. */
export async function setWishHidden(slug: string, id: string, hidden: boolean): Promise<boolean> {
  const db = getSupabaseAdmin();
  if (!db) {
    const wish = memory.wishes.find((w) => w.slug === slug && w.id === id);
    if (!wish) return false;
    wish.hidden = hidden;
    return true;
  }
  const { data, error } = await db
    .from(TABLES.wishes)
    .update({ is_hidden: hidden })
    .eq("wedding_slug", slug)
    .eq("id", id)
    .select("id");
  if (error) throw new Error(`Gagal mengubah ucapan: ${error.message}`);
  return (data ?? []).length > 0;
}

function toWish({ id, name, message, createdAt }: WishRecord): Wish {
  return { id, name, message, createdAt };
}
