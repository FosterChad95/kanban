import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
import MainBoardLayout from "../components/MainBoardLayout";
import prisma from "../lib/prisma";
import React from "react";
import Navbar from "../components/content/Header/Navbar";
import WelcomeText from "@/images/WelcomeText";
import Hero from "../components/Hero";
import TextAndImage from "../components/TextAndImage";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return (
      <main className="min-h-screen flex flex-col relative">
        <Navbar />
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
      </main>
    );
  }

  const dbBoards = await prisma.board.findMany({
    include: {
      columns: {
        include: {
          tasks: {
            include: {
              subtasks: true,
            },
          },
        },
      },
    },
  });

  const boards = dbBoards.map((board) => ({
    id: board.id,
    name: board.name,
    columns: board.columns.map((col) => ({
      id: col.id,
      name: col.name,
      boardId: col.boardId,
      tasks: col.tasks.map((task) => ({
        id: task.id,
        title: task.title,
        description: task.description,
        columnId: task.columnId,
        subtasks: task.subtasks.map((sub) => ({
          id: sub.id,
          title: sub.title,
          isCompleted: sub.isCompleted,
          taskId: sub.taskId,
        })),
      })),
    })),
  }));

  return <MainBoardLayout boards={boards} />;
}
