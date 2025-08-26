import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getUserById } from "@/queries/userQueries";

/**
 * Get the full user object from the database using the session.
 * This ensures we always have the latest role and user data.
 */
export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return null;
  }

  const user = await getUserById(session.user.id);
  return user;
}
