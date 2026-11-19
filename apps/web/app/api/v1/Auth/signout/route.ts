import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/app/utils/session";

export const runtime = "nodejs";

export async function POST() {
  const response = NextResponse.json({ message: "Signed out." });
  clearSessionCookie(response);
  return response;
}
