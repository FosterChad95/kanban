import React from "react";
import Header from "./Header/Header";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-light-gray dark:bg-dark-gray">
      <Header boards={[]} adminOnlyLogo={true} />
      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 flex flex-col overflow-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
