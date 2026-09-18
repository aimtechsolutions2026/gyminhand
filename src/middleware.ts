import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;
    const role = (token?.role as string | undefined)?.toUpperCase();

    // 1. Enforce SUPERADMIN security perimeter
    if (path.startsWith("/admin")) {
      if (role !== "SUPERADMIN") {
        return NextResponse.redirect(new URL("/login?unauthorized=true", req.url));
      }
      return NextResponse.next();
    }

    // 2. Enforce Gym Owner / Manager access for Settings & Staff management
    if (path.startsWith("/owner/settings") || path.startsWith("/owner/staff")) {
      if (role !== "OWNER" && role !== "MANAGER" && role !== "SUPERADMIN") {
        return NextResponse.redirect(new URL("/owner/scan", req.url));
      }
    }

    // 3. Enforce general Gym Staff portal access (Owner, Manager, Trainer, Receptionist, Superadmin)
    if (path.startsWith("/owner")) {
      const allowedRoles = ["OWNER", "MANAGER", "TRAINER", "RECEPTION", "SUPERADMIN"];
      if (!role || !allowedRoles.includes(role)) {
        return NextResponse.redirect(new URL("/login?unauthorized=true", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: [
    "/admin/:path*",
    "/owner/:path*",
  ],
};
