import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createUser } from "@/queries/userQueries";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email: string;
      password: string;
      name?: string | null;
    };
    const { email, password, name } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await createUser({
      email,
      name: typeof name === "string" ? name : undefined,
      hashedPassword,
    });

    // Remove sensitive fields before returning
    const { hashedPassword: removedHashedPassword, ...safeUser } = user;
    void removedHashedPassword;

    return NextResponse.json({ user: safeUser }, { status: 201 });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Unable to create user";
    if (
      message.includes("Unique constraint failed") ||
      message.includes("duplicate key")
    ) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 409 }
      );
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
