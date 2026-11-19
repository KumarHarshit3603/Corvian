import { NextRequest, NextResponse } from "next/server";
import { db } from "@corvian/database/db";
import bcrypt from "bcryptjs";
import { assertSessionSecretConfigured, setSessionCookie } from "@/app/utils/session";
import { signinData } from "@/app/utils/validation";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({
        message: "We couldn't read the sign-in form. Refresh the page and enter your email and password again.",
      }, { status: 400 });
    }

    const parsed = signinData.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({
        message: "We couldn't sign you in yet. Check the information below and correct the missing or invalid fields.",
        errors: parsed.error.issues.map((issue) => ({
          field: issue.path.join(".") || "form",
          message: issue.message,
        })),
      }, { status: 400 });
    }

    const { email, password } = parsed.data;
    if (Buffer.byteLength(password, "utf8") > 72) {
      return NextResponse.json({
        message: "This password is too long to verify. Try a shorter password, or contact support if you still can't access your account.",
      }, { status: 400 });
    }

    assertSessionSecretConfigured();

    const user = await db.orm.public.User.where({ email }).first();
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json({
        message: "We couldn't sign you in with those details. Check your email address and password, then try again. If you don't have an account yet, create one first.",
      }, { status: 401 });
    }

    const response = NextResponse.json({
      message: "Signed in.",
      user: { id: user.id, name: user.name, email: user.email },
    });
    setSessionCookie(response, user.id);
    return response;
  } catch (error) {
    console.error("Signin failed", error);
    return NextResponse.json({
      message: "Sign-in is temporarily unavailable. Your account has not been changed. Please wait a moment and try again.",
    }, { status: 500 });
  }
}
