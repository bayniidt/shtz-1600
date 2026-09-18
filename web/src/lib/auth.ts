import { createHash } from "node:crypto";

import { cookies } from "next/headers";

const COOKIE_NAME = "adfly_admin_session";

function adminPassword(): string {
  return process.env.ADMIN_PASSWORD ?? "adfly2024";
}

function tokenFor(password: string): string {
  return createHash("sha256").update(`adfly::${password}`).digest("hex");
}

export function expectedToken(): string {
  return tokenFor(adminPassword());
}

export function verifyPassword(input: string): boolean {
  return input === adminPassword();
}

export async function isAuthenticated(): Promise<boolean> {
  const store = await cookies();
  return store.get(COOKIE_NAME)?.value === expectedToken();
}

export async function createSession(): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAME, expectedToken(), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
    secure: process.env.NODE_ENV === "production",
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export const SESSION_COOKIE = COOKIE_NAME;
