import React from "react";
import Button from "@/components/ui/Button/Button";
import ThemeToggle from "@/components/ui/ThemeToggle/ThemeToggle";
import EyeSlashIcon from "@/components/ui/Icon/EyeSlashIcon";
import SettingsModal from "@/components/ui/Modal/SettingsModal";
import { motion, AnimatePresence } from "framer-motion";
import IconBoardIcon from "@/components/ui/Icon/IconBoardIcon";
import { useRouter } from "next/navigation";
import { useModal } from "@/providers/ModalProvider";
import AddBoardModal from "@/components/ui/Modal/AddBoardModal";

interface BoardProps {
  id: string;
  name: string;
}

interface SidebarProps {
  boards?: BoardProps[];
  onBoardClick?: (id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ boards = [], onBoardClick }) => {
  const [visible, setVisible] = React.useState(true);
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const numberBoards = boards.length;
  const router = useRouter();
  const { openModal, closeModal } = useModal();

  return (
    <>
      <AnimatePresence>
        {visible && (
          <motion.aside
            key="sidebar"
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-[270px] bg-white border-r border-r-[#E4EBFA] flex flex-col py-4 h-full pr-[24px] min-h-screen shadow-lg overflow-y-auto"
          >
            <div className="flex-1">
              <h2 className="py-4 pl-8 text-medium-gray tracking-[2.4px] uppercase font-bold text-xs">
                All Boards ({numberBoards})
              </h2>
              <div className="flex flex-col gap-2 mt-4">
                {boards.map((board) => (
                  <Button
                    key={board.id}
                    icon={<IconBoardIcon />}
                    variant="secondary"
                    className="rounded-tr-[100px] justify-start rounded-br-[100px] rounded-tl-none rounded-bl-none w-full pl-8 py-[14px] hover:bg-main-purple transition-all hover:text-white"
                    onClick={() => onBoardClick?.(board.id)}
                  >
                    {board.name}
                  </Button>
                ))}
                <Button
                  icon={<IconBoardIcon />}
                  variant="primary-l"
                  className="text-left justify-start !font-normal pr-0 pl-8 bg-transparent text-main-purple hover:bg-transparent hover:text-main-purple-light transition-all"
                  onClick={() =>
                    openModal(
                      <AddBoardModal
                        onCreate={async (payload: {
                          name: string;
                          columns: { name: string }[];
                        }) => {
                          try {
                            await fetch("/api/boards", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify(payload),
                            });
                            closeModal();
                            router.refresh();
                          } catch (err) {
                            console.error("Failed to create board:", err);
                          }
                        }}
                      />
                    )
                  }
                >
                  + Create new board
                </Button>
              </div>
            </div>
            {/* Bottom controls */}
            <div className="mt-auto flex flex-col items-center gap-4 pb-4">
              <ThemeToggle />
              <Button
                variant="secondary"
                className="w-full mb-2"
                onClick={() => setSettingsOpen(true)}
              >
                Settings
              </Button>
              <button
                className="flex items-center gap-2 text-medium-gray hover:text-main-purple transition-colors px-4 py-2 rounded focus:outline-none"
                onClick={() => setVisible(false)}
              >
                <EyeSlashIcon width={20} height={20} />
                <span className="font-semibold text-base">Hide Sidebar</span>
              </button>
            </div>
            <SettingsModal
              isOpen={settingsOpen}
              onClose={() => setSettingsOpen(false)}
            />
          </motion.aside>
        )}
      </AnimatePresence>
      {/* Floating show sidebar button */}
      {!visible && (
        <button
          aria-label="Show Sidebar"
          onClick={() => setVisible(true)}
          className="fixed left-0 bottom-0 z-30 -translate-y-1/2 bg-main-purple hover:bg-main-purple-light transition-colors p-2 rounded-r-lg shadow-lg flex items-center justify-center"
          style={{ width: 40, height: 40 }}
        >
          <EyeSlashIcon
            width={20}
            height={20}
            style={{ transform: "rotate(180deg)", color: "white" }}
          />
        </button>
      )}
    </>
  );
};

export default Sidebar;
