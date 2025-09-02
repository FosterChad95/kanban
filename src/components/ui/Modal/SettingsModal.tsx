"use client";

import { signOut, useSession } from "next-auth/react";
import { Modal } from "./Modal";
import Button from "../Button/Button";
import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { BaseModalProps, TeamOption } from "./types";

interface SettingsModalProps extends BaseModalProps {
  darkMode?: boolean;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  darkMode,
}) => {
  const session = useSession();
  const user = session.data?.user;

  const [teams, setTeams] = useState<TeamOption[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoadingTeams(true);
      fetch("/api/users/me/teams")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setTeams(data);
          } else {
            setTeams([]);
          }
        })
        .catch(() => setTeams([]))
        .finally(() => setLoadingTeams(false));
    }
  }, [isOpen]);

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      title="Settings"
      size="md"
      showCloseButton
    >
      <div
        className={cn("flex flex-col items-center", {
          "text-white": darkMode,
        })}
      >
        {user && (
          <div className="mb-6 w-full text-center">
            <div className="mb-2">
              <span className="font-semibold">Name:</span> {user.name || "N/A"}
            </div>
            {user.email && (
              <div className="mb-2">
                <span className="font-semibold">Email:</span> {user.email}
              </div>
            )}
            <div className="mb-2">
              <span className="font-semibold">
                Team{teams.length !== 1 ? "s" : ""}:
              </span>{" "}
              {loadingTeams
                ? "Loading..."
                : teams.length > 0
                ? teams.map((team) => team.name).join(", ")
                : "N/A"}
            </div>
          </div>
        )}
        <Button
          variant="destructive"
          className="w-full"
          onClick={() => signOut()}
          type="button"
        >
          Sign Out
        </Button>
      </div>
    </Modal>
  );
};

export default SettingsModal;
