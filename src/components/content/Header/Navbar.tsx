import Link from "next/link";
import Logo from "@/images/Logo";

export default function Navbar() {
  return (
    <nav className="w-full flex items-center justify-between px-8 py-4 bg-white/80 backdrop-blur-md shadow-md fixed top-0 left-0 z-10">
      <div className="flex items-center">
        <Link href="/" className="flex items-center">
          <Logo />
        </Link>
      </div>
      <div>
        <a
          href="/signin"
          className="px-5 py-2 rounded bg-main-purple text-white font-semibold shadow hover:bg-purple-700 transition"
        >
          Login
        </a>
      </div>
    </nav>
  );
}
