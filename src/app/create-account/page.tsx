"use client";

import Button from "@/components/ui/Button/Button";
import TextField from "@/components/ui/TextField/TextField";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

type CreateAccountForm = {
  name?: string;
  email: string;
  password: string;
};

export default function CreateAccountPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateAccountForm>({
    mode: "onSubmit",
  });

  const onSubmit = async (data: CreateAccountForm) => {
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as {
          error?: string;
        };

        if (res.status === 409) {
          setError("email", {
            type: "server",
            message: "Email already in use",
          });
        } else if (res.status === 400) {
          setError("root", {
            type: "server",
            message: body?.error || "Email and password are required",
          });
        } else {
          setError("root", {
            type: "server",
            message:
              body?.error || res.statusText || "Unable to create account",
          });
        }
        return;
      }

      router.push("/signin");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Unable to create account";
      setError("root", { type: "server", message });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-[#20212c]">
      <div className="w-full max-w-md flex flex-col items-center mb-4">
        <Link href="/" className="text-main-purple hover:underline text-sm">
          ← Back to front page
        </Link>
      </div>
      <div className="bg-white dark:bg-[#2b2c37] rounded-xl shadow-xl p-8 w-full max-w-md flex flex-col items-center">
        <h1 className="heading-xl mb-6 text-main-purple">Create Account</h1>

        {errors.root?.message && (
          <div className="mb-4 text-red text-center">
            {errors.root.message}
          </div>
        )}

        <form className="w-full mb-4" onSubmit={handleSubmit(onSubmit)}>
          <TextField
            className="w-full mb-2"
            label="Name"
            type="text"
            placeholder="Name (optional)"
            {...register("name")}
          />
          <TextField
            className="w-full mb-2"
            label="Email"
            type="email"
            placeholder="you@example.com"
            required
            error={errors.email?.message}
            {...register("email", {
              required: "Email is required",
              pattern: {
                value:
                  // Basic email pattern
                  /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Please enter a valid email address",
              },
            })}
          />
          <TextField
            className="w-full mb-4"
            label="Password"
            type="password"
            placeholder="Password"
            required
            error={errors.password?.message}
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
            })}
          />

          <Button
            type="submit"
            variant="primary-l"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating account…" : "Create account"}
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
