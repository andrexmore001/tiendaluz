import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
    const { nextUrl } = req;
    const isLoggedIn = !!req.auth;

    // 1. Protect Admin routes
    if (nextUrl.pathname.startsWith("/admin") && !nextUrl.pathname.includes("/login") && !isLoggedIn) {
        return NextResponse.redirect(new URL("/admin/login", nextUrl));
    }

    // 2. Protect API mutations (POST, DELETE, etc.)
    const isApiRoute = nextUrl.pathname.startsWith("/api");
    const isAuthRoute = nextUrl.pathname.startsWith("/api/auth");
    const isReadMethods = ["GET", "OPTIONS"].includes(req.method);
    const isPublicApiRoute = nextUrl.pathname === "/api/contact" && req.method === "POST";

    if (isApiRoute && !isAuthRoute && !isReadMethods && !isPublicApiRoute && !isLoggedIn) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    return NextResponse.next();
});

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
