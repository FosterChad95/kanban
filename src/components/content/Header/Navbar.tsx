"use client";

import Link from "next/link";
import Logo from "@/images/Logo";
import { User } from "@prisma/client";

interface NavbarProps {
  user: User | null;
}

export default function Navbar({ user }: NavbarProps) {
  const isAuth = !!user;

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
        {isAuth ? (
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
