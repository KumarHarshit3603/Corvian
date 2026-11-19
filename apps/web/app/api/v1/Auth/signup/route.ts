import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@corvian/database/db";
import { assertSessionSecretConfigured, setSessionCookie } from "@/app/utils/session";
import { signupData } from "@/app/utils/validation";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({
        message: "We couldn't read the signup form. Refresh the page and submit your details again.",
      }, { status: 400 });
    }

    const parsed = signupData.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({
        message: "We couldn't create your account yet. Review these details and try again.",
        errors: parsed.error.issues.map((issue) => ({
          field: issue.path.join(".") || "form",
          message: issue.message,
        })),
      }, { status: 400 });
    }

    const { name, email, password } = parsed.data;
    if (Buffer.byteLength(password, "utf8") > 72) {
      return NextResponse.json({
        message: "This password is too long to store securely. Choose a shorter password and try again.",
      }, { status: 400 });
    }

    assertSessionSecretConfigured();

    const existing = await db.orm.public.User.where({ email }).first();
    if (existing) {
      return NextResponse.json({
        message: "An account already uses this email address. Sign in with that account or use a different email to register.",
      }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await db.orm.public.User.create({ name, email, password: passwordHash });
    const response = NextResponse.json({
      message: "Account created.",
      user: { id: user.id, name: user.name, email: user.email },
    }, { status: 201 });
    setSessionCookie(response, user.id);
    return response;
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return NextResponse.json({
        message: "An account already uses this email address. Sign in with that account or use a different email to register.",
      }, { status: 409 });
    }
    console.error("Signup failed", error);
    return NextResponse.json({
      message: "We couldn't create your account right now. Please try again in a moment.",
    }, { status: 500 });
  }
}
