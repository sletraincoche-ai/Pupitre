import "server-only";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { supabaseAdmin } from "@/lib/supabase-admin";

const scrypt = promisify(scryptCallback);

const SESSION_COOKIE = "pupitre_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 90; // 90 jours

export type SessionUser = { id: string; identifiant: string };

export async function hashPassword(motDePasse: string): Promise<string> {
  const sel = randomBytes(16).toString("hex");
  const derived = (await scrypt(motDePasse, sel, 64)) as Buffer;
  return `${sel}:${derived.toString("hex")}`;
}

export async function verifyPassword(motDePasse: string, stocke: string): Promise<boolean> {
  const [sel, hashHex] = stocke.split(":");
  if (!sel || !hashHex) return false;
  const derived = (await scrypt(motDePasse, sel, 64)) as Buffer;
  const stockeBuf = Buffer.from(hashHex, "hex");
  if (derived.length !== stockeBuf.length) return false;
  return timingSafeEqual(derived, stockeBuf);
}

export async function creerSession(userId: string): Promise<void> {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();
  const { error } = await supabaseAdmin.from("sessions").insert({ token, user_id: userId, expires_at: expiresAt });
  if (error) throw new Error(error.message);

  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(Date.now() + SESSION_TTL_MS),
  });
}

export async function detruireSession(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    await supabaseAdmin.from("sessions").delete().eq("token", token);
  }
  store.delete(SESSION_COOKIE);
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const { data, error } = await supabaseAdmin
    .from("sessions")
    .select("expires_at, users(id, identifiant)")
    .eq("token", token)
    .maybeSingle();

  if (error || !data) return null;

  if (new Date(data.expires_at).getTime() < Date.now()) {
    await supabaseAdmin.from("sessions").delete().eq("token", token);
    return null;
  }

  const user = Array.isArray(data.users) ? data.users[0] : data.users;
  if (!user) return null;
  return { id: user.id, identifiant: user.identifiant };
}

// Petit garde utilisé par les routes /api/studio/* : toutes exigent un
// compte connecté puisque chaque rang y est scopé par user_id.
export async function requireUser(): Promise<
  { user: SessionUser; response: null } | { user: null; response: NextResponse }
> {
  const user = await getCurrentUser();
  if (!user) {
    return { user: null, response: NextResponse.json({ error: "Non authentifié." }, { status: 401 }) };
  }
  return { user, response: null };
}
