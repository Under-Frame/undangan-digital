import "server-only";

import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

import type { WeddingConfig } from "@/lib/config";

/**
 * Login admin per undangan.
 * - Password diambil dari env var yang ditunjuk config (`"adminPassword": "ENV:NAMA_ENV"`).
 * - Sesi = cookie httpOnly 7 hari berisi `<kedaluwarsa>.<HMAC>`; HMAC memakai password sebagai kunci,
 *   jadi mengganti password otomatis membatalkan semua sesi lama.
 */

export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 hari (detik)

export function sessionCookieName(slug: string) {
  return `undangan_admin_${slug}`;
}

/** Nama env var dari config, mis. "ADMIN_PASSWORD_RINA_DIMAS". */
export function adminPasswordEnvName(config: WeddingConfig) {
  return config.adminPassword.replace(/^ENV:/, "");
}

export function getAdminPassword(config: WeddingConfig): string | null {
  const value = process.env[adminPasswordEnvName(config)];
  return value && value.trim().length > 0 ? value : null;
}

function sha256(value: string) {
  return createHash("sha256").update(value).digest();
}

export function passwordMatches(input: string, actual: string) {
  // Bandingkan hash dengan panjang sama → aman dari timing attack.
  return timingSafeEqual(sha256(input), sha256(actual));
}

function sign(slug: string, expires: number, password: string) {
  const key = password + (process.env.ADMIN_SESSION_SECRET ?? "");
  return createHmac("sha256", key).update(`${slug}.${expires}`).digest("base64url");
}

export function createSessionValue(slug: string, password: string) {
  const expires = Date.now() + SESSION_MAX_AGE * 1000;
  return `${expires}.${sign(slug, expires, password)}`;
}

function verifySessionValue(slug: string, value: string | undefined, password: string) {
  if (!value) return false;
  const [expRaw, signature] = value.split(".");
  const expires = Number(expRaw);
  if (!signature || !Number.isFinite(expires) || expires < Date.now()) return false;
  const expected = Buffer.from(sign(slug, expires, password));
  const given = Buffer.from(signature);
  return expected.length === given.length && timingSafeEqual(expected, given);
}

/** Apakah request ini membawa sesi admin yang valid untuk undangan `config.slug`? */
export async function isAdmin(config: WeddingConfig) {
  const password = getAdminPassword(config);
  if (!password) return false;
  const store = await cookies();
  return verifySessionValue(config.slug, store.get(sessionCookieName(config.slug))?.value, password);
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};
