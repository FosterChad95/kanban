import React from "react";
import CreateBoardClient from "../../../components/CreateBoardClient";
import { getCurrentUser } from "../../../lib/auth";
import { redirect } from "next/navigation";

/**
 * Create Board Page
 * This page is shown when there are no boards.
 * It renders a backdrop with the AddBoardModal that cannot be closed.
 */
export default async function CreateBoardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/signin");
  }

  // If admin, redirect to admin page
  if (user.role === "ADMIN") {
    redirect("/admin");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CreateBoardClient showTeamAccess={false} />
    </div>
  );
}
