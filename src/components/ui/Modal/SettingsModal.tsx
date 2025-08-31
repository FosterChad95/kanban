"use client";

import { signOut, useSession } from "next-auth/react";
import Modal from "./Modal";
import Button from "../Button/Button";
import React, { useEffect, useState } from "react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const session = useSession();
  const user = session.data?.user;

  const [teams, setTeams] = useState<{ id: string; name: string }[]>([]);
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
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col items-center">
        <h2 className="heading-large mb-6 text-main-purple">Settings</h2>
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
        >
          Sign Out
        </Button>
      </div>
    </Modal>
  );
};

export default SettingsModal;
