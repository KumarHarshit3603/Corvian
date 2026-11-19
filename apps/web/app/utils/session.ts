import { createHmac, timingSafeEqual } from "node:crypto";
import type { NextRequest, NextResponse } from "next/server";

export const SESSION_COOKIE_NAME = "corvian_session";
export const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;

type SessionPayload = { userId: number; expiresAt: number };

function getSessionSecret() {
  const secret = process.env.AUTH_SECRET;
  if (secret && Buffer.byteLength(secret) >= 32) return secret;

  if (process.env.NODE_ENV !== "production") {
    return "corvian-local-development-secret-do-not-use-in-production";
  }

  throw new Error("AUTH_SECRET must be set to at least 32 bytes in production.");
}

export function assertSessionSecretConfigured() {
  getSessionSecret();
}

function signatureFor(payload: string) {
  return createHmac("sha256", getSessionSecret()).update(payload).digest("base64url");
}

export function createSessionToken(userId: number, now = Date.now()) {
  const payload: SessionPayload = {
    userId,
    expiresAt: Math.floor(now / 1000) + SESSION_TTL_SECONDS,
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encodedPayload}.${signatureFor(encodedPayload)}`;
}

export function verifySessionToken(token: string | undefined, now = Date.now()): number | null {
  if (!token) return null;
  const [encodedPayload, providedSignature, extra] = token.split(".");
  if (!encodedPayload || !providedSignature || extra !== undefined) return null;

  try {
    const expectedSignature = Buffer.from(signatureFor(encodedPayload), "base64url");
    const actualSignature = Buffer.from(providedSignature, "base64url");
    if (actualSignature.length !== expectedSignature.length || !timingSafeEqual(actualSignature, expectedSignature)) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8")) as Partial<SessionPayload>;
    if (!Number.isSafeInteger(payload.userId) || (payload.userId ?? 0) < 1) return null;
    if (!Number.isSafeInteger(payload.expiresAt) || (payload.expiresAt ?? 0) <= Math.floor(now / 1000)) return null;
    return payload.userId as number;
  } catch {
    return null;
  }
}

export function getSessionUserId(request: NextRequest) {
  return verifySessionToken(request.cookies.get(SESSION_COOKIE_NAME)?.value);
}

export function setSessionCookie(response: NextResponse, userId: number) {
  response.cookies.set(SESSION_COOKIE_NAME, createSessionToken(userId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
