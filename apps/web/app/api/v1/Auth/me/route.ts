import { NextRequest, NextResponse } from "next/server";
import { db } from "@corvian/database/db";
import { clearSessionCookie, getSessionUserId } from "@/app/utils/session";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const userId = getSessionUserId(request);
    if (!userId) return NextResponse.json({ message: "Not signed in." }, { status: 401 });

    const user = await db.orm.public.User.where({ id: userId }).first();
    if (!user) {
      const response = NextResponse.json({ message: "Not signed in." }, { status: 401 });
      clearSessionCookie(response);
      return response;
    }

    return NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("Session lookup failed", error);
    return NextResponse.json({ message: "Could not check your session." }, { status: 500 });
  }
}
