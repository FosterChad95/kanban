import React from "react";
import Navbar from "../components/content/Header/Navbar";
import WelcomeText from "@/images/WelcomeText";
import Hero from "../components/Hero";
import TextAndImage from "../components/TextAndImage";
import { getCurrentUser } from "@/lib/auth";
import Footer from "../components/content/Footer/Footer";

/**
 * Public landing page.
 * Authentication and redirects are handled by middleware for protected routes
 * (e.g. /dashboard). This page is a simple marketing/landing page and does not
 * perform any session checks.
 */
export default async function Home() {
  const user = await getCurrentUser();

  return (
    <main className="min-h-screen flex flex-col relative">
      <Navbar user={user} />
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
        heading="Visualize Your Workflow"
        text={
          <>
            Drag and drop tasks between columns to keep your team in sync and
            your projects on track.
          </>
        }
        buttonText="Learn More"
        imageSrc="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80"
        imageAlt="Kanban Board Example"
      />
      <TextAndImage
        heading="Collaborate Effortlessly"
        text={
          <>
            Share boards, assign tasks, and communicate with your team in real
            time.
          </>
        }
        buttonText="See Collaboration"
        imageSrc="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80"
        imageAlt="Team Collaboration"
        imageLeft
      />
      <Footer />
    </main>
  );
}
