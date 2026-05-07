import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcrypt";
import { prisma } from "./prisma";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: "user" | "admin";
}

// ─── Secret key ───────────────────────────────────────────────────────────────

const SECRET = process.env.SESSION_SECRET;
if (!SECRET) throw new Error("SESSION_SECRET environment variable is not set");
const encodedKey = new TextEncoder().encode(SECRET);

const COOKIE_NAME = "nlk_session";
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in ms

// ─── JWT encrypt / decrypt ────────────────────────────────────────────────────

export async function encrypt(payload: SessionUser): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedKey);
}

export async function decrypt(token: string | undefined): Promise<SessionUser | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, encodedKey, {
      algorithms: ["HS256"],
    });
    return payload as unknown as SessionUser;
  } catch {
    return null;
  }
}

// ─── Session helpers ──────────────────────────────────────────────────────────

export async function createSession(user: SessionUser): Promise<void> {
  const token = await encrypt(user);
  const expiresAt = new Date(Date.now() + SESSION_DURATION);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  return decrypt(token);
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

// ─── Password utilities ───────────────────────────────────────────────────────

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ─── Auth actions ─────────────────────────────────────────────────────────────

export async function registerUser(name: string, email: string, password: string) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error("An account with this email already exists");
  const hash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { email, password: hash, name, role: "user" },
  });
  return user;
}

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("Invalid email or password");
  const valid = await verifyPassword(password, user.password);
  if (!valid) throw new Error("Invalid email or password");
  return user;
}
