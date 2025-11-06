import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized: ({ token, req }) => {
      const { pathname } = req.nextUrl;

      // Allow access to public routes
      if (
        pathname === "/" ||
        pathname === "/login" ||
        pathname === "/signup" ||
        pathname === "/signup/form" ||
        pathname.startsWith("/api/") ||
        pathname === "/blogs" ||
        pathname.startsWith("/blogs/") ||
        pathname === "/faq" ||
        pathname === "/privacy-policy" ||
        pathname === "/test-base64" ||
        pathname.startsWith("/_next/") ||
        pathname.startsWith("/images/") ||
        pathname === "/favicon.ico"
      ) {
        return true;
      }

      // Require authentication for protected routes
      return !!token;
    },
  },
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes except auth)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|images|.*\\..*).*)",
  ],
};
