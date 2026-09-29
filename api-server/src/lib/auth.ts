import { createHmac, randomUUID, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import type { NextFunction, Request, Response } from "express";
import { and, eq, gt } from "drizzle-orm";
import { db, sessionsTable } from "@workspace/db";

const scrypt = promisify(scryptCallback);
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

function getSessionSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET must be set.");
  return secret;
}

export async function hashPassword(password: string) {
  const salt = Buffer.from(randomUUID().replace(/-/g, ""), "hex").toString("hex");
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt}:${derived.toString("hex")}`;
}

export async function verifyPassword(password: string, storedHash: string) {
  const [salt, expectedHex] = storedHash.split(":");
  if (!salt || !expectedHex) return false;
  const actual = (await scrypt(password, salt, 64)) as Buffer;
  const expected = Buffer.from(expectedHex, "hex");
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

type SessionPayload = {
  sid: string;
  uid: string;
  exp: number;
};

function encodePayload(payload: SessionPayload) {
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

function signPayload(payload: string) {
  return createHmac("sha256", getSessionSecret()).update(payload).digest("base64url");
}

function decodeToken(token: string): SessionPayload | null {
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const expectedSignature = signPayload(payload);
  const provided = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) return null;

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as Partial<SessionPayload>;
    if (
      typeof parsed.sid !== "string" ||
      typeof parsed.uid !== "string" ||
      typeof parsed.exp !== "number" ||
      parsed.exp <= Date.now()
    ) {
      return null;
    }
    return parsed as SessionPayload;
  } catch {
    return null;
  }
}

export function getBearerToken(request: Request) {
  const header = request.header("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  return header.slice("Bearer ".length).trim() || null;
}

export async function createSession(userId: string) {
  const sid = randomUUID();
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await db.insert(sessionsTable).values({ id: sid, userId, expiresAt });
  return `${encodePayload({ sid, uid: userId, exp: expiresAt.getTime() })}.${signPayload(
    encodePayload({ sid, uid: userId, exp: expiresAt.getTime() }),
  )}`;
}

export async function revokeSession(token: string | null) {
  const payload = token ? decodeToken(token) : null;
  if (payload) await db.delete(sessionsTable).where(eq(sessionsTable.id, payload.sid));
}

export async function requireAuth(request: Request, response: Response, next: NextFunction) {
  const token = getBearerToken(request);
  const payload = token ? decodeToken(token) : null;
  if (!payload) {
    response.status(401).json({ message: "Aanmelden is vereist." });
    return;
  }

  try {
    const [session] = await db
      .select({ userId: sessionsTable.userId })
      .from(sessionsTable)
      .where(
        and(
          eq(sessionsTable.id, payload.sid),
          eq(sessionsTable.userId, payload.uid),
          gt(sessionsTable.expiresAt, new Date()),
        ),
      )
      .limit(1);

    if (!session) {
      response.status(401).json({ message: "Deze sessie is verlopen." });
      return;
    }

    request.userId = session.userId;
    next();
  } catch (error) {
    next(error);
  }
}