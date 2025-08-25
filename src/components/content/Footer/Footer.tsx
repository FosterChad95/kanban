import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="w-full py-6 px-4 mt-12 bg-light-gray dark:bg-very-dark-gray text-medium-gray dark:text-light-gray font-sans text-center border-t border-lines-light dark:border-lines-dark">
      <div className="flex flex-col items-center gap-2">
        <span className="text-sm">
          &copy; {new Date().getFullYear()} Kanban Board. All rights reserved.
        </span>
        <span className="text-xs">
          Built with <span className="text-main-purple font-bold">Next.js</span>{" "}
          & Tailwind CSS
        </span>
      </div>
    </footer>
  );
};

export default Footer;
