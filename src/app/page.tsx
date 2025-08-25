import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
import MainBoardLayout from "../components/MainBoardLayout";
import { demoColumns } from "../../data/mock/board";
import React from "react";
import Link from "next/link";
import Logo from "@/images/Logo";
import WelcomeText from "@/images/WelcomeText";
import Footer from "../components/content/Footer/Footer";
import Hero from "../components/Hero";
import TextAndImage from "../components/TextAndImage";

// Mock boards data for Header and Sidebar
const boards = [
  { id: "1", name: "Platform Launch", active: true, columns: demoColumns },
  { id: "2", name: "Marketing Plan", active: false, columns: [] },
  { id: "3", name: "Roadmap", active: false, columns: [] },
];

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) {
    // Keep the landing page for unauthenticated users
    return (
      <main className="min-h-screen flex flex-col bg-gradient-to-b from-purple-100 to-white relative">
        {/* Navbar */}
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
        <Hero
          title={
            <>
              Organize Your Work, <br /> Achieve More
            </>
          }
          description={
            <>
              KanbanFlow helps you manage tasks, track progress, and collaborate
              with your team. Visualize your workflow and get things done
              efficiently.
            </>
          }
        >
          <WelcomeText />
        </Hero>
        <TextAndImage
          text={
            <>
              <strong>Visualize your workflow.</strong> Drag and drop tasks
              between columns to keep your team in sync and your projects on
              track.
            </>
          }
          imageSrc="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80"
          imageAlt="Kanban Board Example"
        />
        <TextAndImage
          text={
            <>
              <strong>Collaborate effortlessly.</strong> Share boards, assign
              tasks, and communicate with your team in real time.
            </>
          }
          imageSrc="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80"
          imageAlt="Team Collaboration"
          imageLeft
        />
        <div className="flex-shrink-0">
          <Footer />
        </div>
      </main>
    );
  }

  // Show main board layout for authenticated users
  return <MainBoardLayout boards={boards} columns={demoColumns} />;
}
