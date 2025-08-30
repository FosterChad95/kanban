"use client";
import React from "react";
import Button from "@/components/ui/Button/Button";
import ThemeToggle from "@/components/ui/ThemeToggle/ThemeToggle";
import EyeSlashIcon from "@/components/ui/Icon/EyeSlashIcon";
import SettingsModal from "@/components/ui/Modal/SettingsModal";
import { motion, AnimatePresence } from "framer-motion";
import IconBoardIcon from "@/components/ui/Icon/IconBoardIcon";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useModal } from "@/providers/ModalProvider";
import AddBoardModal from "@/components/ui/Modal/AddBoardModal";
import Logo from "@/images/Logo";

interface BoardProps {
  id: string;
  name: string;
}

interface SidebarProps {
  boards?: BoardProps[];
  visible: boolean;
  onHideSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  boards = [],
  visible,
  onHideSidebar,
}) => {
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [logoVisible, setLogoVisible] = React.useState(true);
  const numberBoards = boards.length;
  const router = useRouter();
  const params = useParams();
  const currentBoardId = (params as any)?.boardId;
  const { openModal, closeModal } = useModal();

  // Handle fade-out before hiding sidebar
  React.useEffect(() => {
    if (!visible) {
      setLogoVisible(false);
    } else {
      setLogoVisible(true);
    }
  }, [visible]);

  // When logo fade-out completes, trigger sidebar hide
  const handleHideSidebar = () => {
    setLogoVisible(false);
    setTimeout(() => {
      onHideSidebar();
    }, 300); // match logo fade duration
  };

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
            className="w-[270px] bg-white dark:bg-dark-gray border-r border-r-[#E4EBFA] dark:border-r-lines-dark flex flex-col py-8 h-full pr-[24px] min-h-screen shadow-lg overflow-y-auto"
          >
            {/* Sidebar Logo with fade-out */}
            <motion.div
              initial={{ opacity: 1 }}
              animate={{ opacity: logoVisible ? 1 : 0 }}
              transition={{ duration: 0.3 }}
              className="pl-8"
            >
              <Logo />
            </motion.div>
            <div className="flex-1 pt-12">
              <h2 className="py-4 pl-8 text-medium-gray tracking-[2.4px] uppercase font-bold text-xs">
                All Boards ({numberBoards})
              </h2>
              <div className="flex flex-col gap-2 mt-4">
                {boards.map((board) => {
                  const isActive = board.id === currentBoardId;
                  return (
                    <Link
                      key={board.id}
                      href={`/dashboard/${board.id}`}
                      aria-current={isActive ? "page" : undefined}
                      className={`flex items-center gap-3 rounded-tr-[100px] justify-start rounded-br-[100px] rounded-tl-none rounded-bl-none w-full pl-8 py-[14px] transition-all ${
                        isActive
                          ? "bg-main-purple text-white"
                          : "hover:bg-main-purple hover:text-white"
                      }`}
                    >
                      <span className="inline-flex items-center justify-center mr-2">
                        <IconBoardIcon
                          className={isActive ? "text-white" : ""}
                        />
                      </span>
                      <span className="truncate">{board.name}</span>
                    </Link>
                  );
                })}
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
                            const res = await fetch("/api/boards", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify(payload),
                            });
                            if (!res.ok) {
                              let detail = "";
                              try {
                                const data = await res.json();
                                detail = data?.error ? `: ${data.error}` : "";
                              } catch {}
                              console.error(`Failed to create board${detail}`);
                              return;
                            }
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
                className="mb-2"
                onClick={() => setSettingsOpen(true)}
              >
                Settings
              </Button>
              <button
                className="flex items-center gap-2 text-medium-gray hover:text-main-purple transition-colors px-4 py-2 rounded focus:outline-none"
                onClick={handleHideSidebar}
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
      {/* Floating show sidebar button is now handled by parent */}
      {/* (Removed from Sidebar) */}
    </>
  );
};

export default Sidebar;
