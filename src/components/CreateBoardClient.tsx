"use client";

import React from "react";
import AddBoardModal from "./ui/Modal/AddBoardModal";
import { useRouter } from "next/navigation";

interface CreateBoardClientProps {
  showTeamAccess: boolean;
}

export default function CreateBoardClient({ showTeamAccess }: CreateBoardClientProps) {
  const router = useRouter();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <AddBoardModal
        showTeamAccess={showTeamAccess}
        onCreate={async (form) => {
          // Map form to API expected format
          const payload = {
            name: form.name,
            columns: form.columns.filter(
              (col) => (col.name ?? "").trim() !== ""
            ),
          };

          try {
            const res = await fetch("/api/boards", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });

            if (!res.ok) {
              const errorData = await res.json().catch(() => ({}));
              throw new Error(errorData.error || "Failed to create board");
            }

            const newBoard = await res.json();
            console.log("Board created successfully:", newBoard);

            // Redirect to the newly created board
            router.push(`/dashboard/${newBoard.id}`);
          } catch (err) {
            console.error("Error creating board:", err);
            // Optional: Show error to user
            alert(
              `Failed to create board: ${
                err instanceof Error ? err.message : "Unknown error"
              }`
            );
          }
        }}
      />
    </div>
  );
}