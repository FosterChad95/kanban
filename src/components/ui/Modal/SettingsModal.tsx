"use client";

import { signOut } from "next-auth/react";
import Modal from "./Modal";
import Button from "../Button/Button";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col items-center">
        <h2 className="heading-large mb-6 text-main-purple">Settings</h2>
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
