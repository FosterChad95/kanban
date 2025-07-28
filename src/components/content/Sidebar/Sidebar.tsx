import React from "react";
import Button from "@/components/ui/Button/Button";

interface BoardProps {
  id: string;
  name: string;
}

interface SidebarProps {
  boards?: BoardProps[];
  onBoardClick?: (id: string) => void;
  onCreateBoard?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  boards = [],
  onBoardClick,
  onCreateBoard,
}) => {
  const numberBoards = boards.length;

  return (
    <aside className="w-[270px] bg-white border-r border-r-[#E4EBFA] flex flex-col py-4 h-screen pr-[24px]">
      <h2 className="py-4 text-medium-gray tracking-[2.4px] uppercase font-bold text-xs">
        All Boards ({numberBoards})
      </h2>
      <div className="flex flex-col flex-1 gap-2 mt-4">
        {boards.map((board) => (
          <Button
            key={board.id}
            icon={"icon-board"}
            variant="secondary"
            className="rounded-tr-[100px] rounded-br-[100px] rounded-tl-none rounded-bl-none w-full pl-0 pr-[94px] py-[14px] hover:bg-main-purple-light transition-all"
            onClick={() => onBoardClick?.(board.id)}
          >
            {board.name}
          </Button>
        ))}
        <Button
          variant="primary-l"
          className="text-left bg-transparent text-main-purple hover:bg-transparent hover:text-main-purple-light transition-all pl-0"
          onClick={onCreateBoard}
        >
          + Create new board
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;
