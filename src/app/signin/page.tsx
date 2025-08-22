"use client";

import { signIn } from "next-auth/react";
import Button from "@/components/ui/Button/Button";
import { useSearchParams } from "next/navigation";

export default function SignInPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

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
        <Button
          variant="primary-l"
          className="w-full mb-4"
          onClick={() => signIn("google")}
        >
          Sign in with Google
        </Button>
        <Button
          variant="secondary"
          className="w-full"
          onClick={() => signIn("github")}
        >
          Sign in with GitHub
        </Button>
      </div>
    </div>
  );
}
