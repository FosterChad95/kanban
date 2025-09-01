import MainBoardLayout from "@/components/MainBoardLayout";
import { getCurrentUser } from "@/lib/auth";
import { getBoardsForUser } from "@/queries/boardQueries";
import { redirect } from "next/navigation";
import React from "react";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  if (user?.role === "ADMIN") redirect("/admin");

  if (!user) redirect("/");

  const dbBoards = await getBoardsForUser({ id: user.id, role: user.role });

  return <MainBoardLayout boards={dbBoards}>{children}</MainBoardLayout>;
}
