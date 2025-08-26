"use client";

import React from "react";
import AddBoardModal from "../../../components/ui/Modal/AddBoardModal";
import { Prisma } from "@prisma/client";
import { useRouter } from "next/navigation";
/**
 * Create Board Page
 * This page is shown when there are no boards.
 * It renders a backdrop with the AddBoardModal that cannot be closed.
 */
export default function CreateBoardPage() {
  const router = useRouter();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <AddBoardModal
        onCreate={async (form) => {
          // Map form to Prisma.BoardCreateInput
          const payload: Prisma.BoardCreateInput = {
            name: form.name,
            columns: {
              create: (form.columns ?? [])
                .filter((col) => (col.name ?? "").trim() !== "")
                .map((col) => ({
                  name: col.name,
                })),
            },
          };
          try {
            const res = await fetch("/api/boards", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });
            if (!res.ok) {
              throw new Error("Failed to create board");
            }
            router.push("/dashboard");
          } catch (err) {
            console.error("Error creating board:", err);
          }
        }}
      />
    </div>
  );
}
