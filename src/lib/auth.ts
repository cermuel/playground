import { createHmac, randomBytes, scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";

import { and, eq, isNull } from "drizzle-orm";
import { cookies } from "next/headers";

import { getDb } from "@/db";
import { admins } from "@/db/schema";

const scryptAsync = promisify(scrypt);

const cookieName = "images_admin_session";
const sessionMaxAgeSeconds = 60 * 60 * 24 * 7;

type SessionPayload = {
  adminId: string;
  expiresAt: number;
};

export type AdminSession = {
  email: string;
  id: string;
};

function getAuthSecret() {
  const secret = process.env.ADMIN_AUTH_SECRET;

  if (secret) {
    return secret;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("ADMIN_AUTH_SECRET is required in production.");
  }

  return "local-development-admin-auth-secret";
}

function signPayload(payload: string) {
  return createHmac("sha256", getAuthSecret()).update(payload).digest("base64url");
}

function encodeSession(payload: SessionPayload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = signPayload(body);

  return `${body}.${signature}`;
}

function decodeSession(value: string | undefined): SessionPayload | null {
  if (!value) return null;

  const [body, signature] = value.split(".");

  if (!body || !signature || signPayload(body) !== signature) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8"),
    ) as Partial<SessionPayload>;

    if (
      typeof payload.adminId !== "string" ||
      typeof payload.expiresAt !== "number" ||
      payload.expiresAt <= Date.now()
    ) {
      return null;
    }

    return {
      adminId: payload.adminId,
      expiresAt: payload.expiresAt,
    };
  } catch {
    return null;
  }
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("base64url");
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;

  return `scrypt:${salt}:${derivedKey.toString("base64url")}`;
}

export async function verifyPassword(password: string, passwordHash: string) {
  const [scheme, salt, hash] = passwordHash.split(":");

  if (scheme !== "scrypt" || !salt || !hash) {
    return false;
  }

  const storedKey = Buffer.from(hash, "base64url");
  const derivedKey = (await scryptAsync(password, salt, storedKey.length)) as Buffer;

  return (
    storedKey.length === derivedKey.length &&
    timingSafeEqual(storedKey, derivedKey)
  );
}

export async function createAdminSession(adminId: string) {
  const cookieStore = await cookies();
  const expiresAt = Date.now() + sessionMaxAgeSeconds * 1000;

  cookieStore.set(cookieName, encodeSession({ adminId, expiresAt }), {
    httpOnly: true,
    maxAge: sessionMaxAgeSeconds,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();

  cookieStore.set(cookieName, "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  cookieStore.set(cookieName, "", {
    httpOnly: true,
    maxAge: 0,
    path: "/images/manage",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const payload = decodeSession(cookieStore.get(cookieName)?.value);

  if (!payload) {
    return null;
  }

  const db = getDb();
  const [admin] = await db
    .select({
      email: admins.email,
      id: admins.id,
    })
    .from(admins)
    .where(and(eq(admins.id, payload.adminId), isNull(admins.deletedAt)))
    .limit(1);

  return admin ?? null;
}

export async function requireAdminSession() {
  const session = await getAdminSession();

  if (!session) {
    throw new Error("Unauthorized");
  }

  return session;
}
