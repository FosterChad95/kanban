"use client";

import Button from "@/components/ui/Button/Button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CreateAccountPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-[#20212c]">
      <div className="bg-white dark:bg-[#2b2c37] rounded-xl shadow-xl p-8 w-full max-w-md flex flex-col items-center">
        <h1 className="heading-xl mb-6 text-main-purple">Create Account</h1>

        {error && <div className="mb-4 text-red-600 text-center">{error}</div>}

        <form
          className="w-full mb-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setError(null);
            setLoading(true);

            const form = e.currentTarget as HTMLFormElement;
            const formData = new FormData(form);
            const name = (formData.get("name") as string) || undefined;
            const email = (formData.get("email") as string) || "";
            const password = (formData.get("password") as string) || "";

            if (!email || !password) {
              setError("Email and password are required");
              setLoading(false);
              return;
            }

            try {
              const res = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
              });

              if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body?.error || res.statusText);
              }

              // Account created: route to sign-in
              router.push("/signin");
            } catch (err: unknown) {
              const message =
                err instanceof Error ? err.message : "Unable to create account";
              setError(message);
            } finally {
              setLoading(false);
            }
          }}
        >
          <input
            name="name"
            type="text"
            placeholder="Name (optional)"
            className="w-full mb-2 p-2 rounded border"
          />
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
            type="submit"
            variant="primary-l"
            className="w-full"
            disabled={loading}
          >
            {loading ? "Creating account…" : "Create account"}
          </Button>
        </form>

        <div className="w-full text-center text-sm text-gray-600 dark:text-gray-300">
          Already have an account?{" "}
          <Link href="/signin" className="text-main-purple hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
