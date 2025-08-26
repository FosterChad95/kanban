"use client";

import { signIn } from "next-auth/react";
import Button from "@/components/ui/Button/Button";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function SignInPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-[#20212c]">
      <div className="bg-white dark:bg-[#2b2c37] rounded-xl shadow-xl p-8 w-full max-w-md flex flex-col items-center">
        <h1 className="heading-xl mb-6 text-main-purple">Sign In</h1>

        {error && (
          <div className="mb-4 text-red-600 text-center">
            {error === "OAuthAccountNotLinked"
              ? "Account already exists with a different sign-in method."
              : "Sign in failed. Please try again."}
          </div>
        )}

        {/* Email/password form */}
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setLoading(true);
            const form = e.currentTarget as HTMLFormElement;
            const formData = new FormData(form);
            const email = (formData.get("email") as string) || "";
            const password = (formData.get("password") as string) || "";

            if (!email || !password) {
              alert("Email and password are required");
              setLoading(false);
              return;
            }

            // Use NextAuth credentials signIn
            await signIn("credentials", {
              redirect: true,
              email,
              password,
              callbackUrl: "/",
            });

            setLoading(false);
          }}
          className="w-full mb-4"
        >
          <input
            name="email"
            type="email"
            placeholder="you@example.com"
            className="w-full mb-2 p-2 rounded border"
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            className="w-full mb-4 p-2 rounded border"
          />
          <Button
            variant="primary-l"
            className="w-full"
            type="submit"
            disabled={loading}
          >
            {loading ? "Signing in…" : "Sign in with email"}
          </Button>
        </form>

        <div className="w-full mb-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button
            variant="primary-s"
            className="w-full px-4 py-2"
            onClick={() => signIn("google", { callbackUrl: "/" })}
          >
            Sign in with Google
          </Button>
          <Button
            variant="secondary"
            className="w-full px-4 py-2"
            onClick={() => signIn("github", { callbackUrl: "/" })}
          >
            Sign in with GitHub
          </Button>
        </div>

        <div className="w-full text-center">
          <Link
            href="/create-account"
            className="text-main-purple hover:underline"
          >
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}
