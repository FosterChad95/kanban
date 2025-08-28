import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  if (!id) {
    return NextResponse.json(
      { error: "User ID is required." },
      { status: 400 }
    );
  }

  try {
    await prisma.user.delete({
      where: { id },
    });
    return NextResponse.json(
      { message: "User deleted successfully." },
      { status: 200 }
    );
  } catch {
    // Optionally log error
    return NextResponse.json(
      { error: "Failed to delete user." },
      { status: 500 }
    );
  }
}
