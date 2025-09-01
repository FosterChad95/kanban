import { getBoardsForUser } from "../../queries/boardQueries";
import { getCurrentUser } from "../../lib/auth";
import { redirect } from "next/navigation";

/**
 * Dashboard index: Handle auth, fetch user's boards and redirect to first board or create-board.
 */
export default async function DashboardIndexPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/signin");
  }

  // If admin, redirect to admin page
  if (user.role === "ADMIN") {
    redirect("/admin");
  }

  // Get user's boards
  const dbBoards = await getBoardsForUser({ id: user.id, role: user.role });

  // If no boards, redirect to create board
  if (dbBoards.length === 0) {
    redirect("/dashboard/create-board");
  }

  // If we have boards, redirect to the first one
  redirect(`/dashboard/${dbBoards[0].id}`);
}
