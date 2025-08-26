import { withAuth } from "next-auth/middleware";

// Protect /dashboard using NextAuth middleware.
// Unauthenticated users will be redirected to /signin (with callbackUrl back to the original page).
export default withAuth({
  pages: {
    signIn: "/signin",
  },
  callbacks: {
    authorized: ({ token }) => {
      // If a token exists, the user is authenticated

      return !!token;
    },
  },
});

export const config = {
  // Apply middleware to /dashboard and any nested routes
  matcher: ["/dashboard/:path*"],
};
