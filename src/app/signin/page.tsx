"use client";

import { signIn } from "next-auth/react";
import Button from "@/components/ui/Button/Button";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import TextField from "@/components/ui/TextField/TextField";
import { useForm } from "react-hook-form";
import { useState } from "react";

type SignInForm = {
  email: string;
  password: string;
};

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlError = searchParams.get("error");
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInForm>({
    mode: "onSubmit",
  });

  const onSubmit = async (data: SignInForm) => {
    setAuthError(null);
    const res = await signIn("credentials", {
      redirect: false,
      email: data.email,
      password: data.password,
    });
    if (res?.error) {
      const message =
        res.error === "CredentialsSignin" || res.error === "InvalidCredentials"
          ? "Invalid email or password"
          : "Sign in failed. Please try again.";
      setAuthError(message);
      return;
    }
    router.push("/");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-[#20212c]">
      <div className="bg-white dark:bg-[#2b2c37] rounded-xl shadow-xl p-8 w-full max-w-md flex flex-col items-center">
        <h1 className="heading-xl mb-6 text-main-purple">Sign In</h1>

        {(authError || urlError) && (
          <div className="mb-4 text-red text-center">
            {authError ??
              (urlError === "OAuthAccountNotLinked"
                ? "Account already exists with a different sign-in method."
                : urlError === "CredentialsSignin" ||
                  urlError === "InvalidCredentials"
                ? "Invalid email or password"
                : "Sign in failed. Please try again.")}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="w-full mb-4">
          <TextField
            className="w-full mb-2"
            label="Email"
            type="email"
            placeholder="you@example.com"
            required
            error={errors.email?.message}
            {...register("email", { required: "Email is required" })}
          />
          <TextField
            className="w-full mb-4"
            label="Password"
            type="password"
            placeholder="Password"
            required
            error={errors.password?.message}
            {...register("password", { required: "Password is required" })}
          />
          <Button
            variant="primary-l"
            className="w-full"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing in…" : "Sign in with email"}
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
