"use client";

import { signOut, useSession } from "next-auth/react";
import Modal from "./Modal";
import Button from "../Button/Button";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { data: session } = useSession();

  const user = session?.user;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col items-center">
        <h2 className="heading-large mb-6 text-main-purple">Settings</h2>
        {user && (
          <div className="mb-6 w-full text-center">
            <div className="mb-2">
              <span className="font-semibold">Name:</span> {user.name || "N/A"}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Role:</span> {user.role || "N/A"}
            </div>
            {user.email && (
              <div className="mb-2">
                <span className="font-semibold">Email:</span> {user.email}
              </div>
            )}
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
