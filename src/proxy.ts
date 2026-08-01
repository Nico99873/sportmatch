import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export const proxy = auth((req) => {
  const { nextUrl } = req;
  const session = req.auth;

  if (nextUrl.pathname.startsWith("/dashboard")) {
    if (!session || session.user?.role !== "ASD") {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*"],
};
