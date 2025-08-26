"use client";

import Link from "next/link";
import Logo from "@/images/Logo";
import Button from "@/components/ui/Button/Button";
import { useSession } from "next-auth/react";

export default function Navbar() {
  const { status } = useSession();
  const isAuth = status === "authenticated";

  const sharedButtonStyles =
    "px-5 py-2 rounded bg-main-purple text-white font-semibold shadow hover:bg-purple-700 transition";

  return (
    <nav className="w-full flex items-center justify-between px-8 py-4 bg-white/80 backdrop-blur-md shadow-md fixed top-0 left-0 z-10">
      <div className="flex items-center">
        <Link href="/" className="flex items-center">
          <Logo />
        </Link>
      </div>
      <div>
        {status === "loading" ? (
          <Button
            variant="primary-s"
            className={`${sharedButtonStyles} cursor-wait`}
            disabled
            aria-busy="true"
          >
            Loading...
          </Button>
        ) : isAuth ? (
          <Link href="/dashboard" className={sharedButtonStyles}>
            Dashboard
          </Link>
        ) : (
          <Link href="/signin" className={sharedButtonStyles}>
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}
