"use client";
import React from "react";
import AdminLayout from "@/components/content/AdminLayout";
import BoardsSection from "@/components/admin/BoardsSection";
import TeamsSection from "@/components/admin/TeamsSection";
import UsersSection from "@/components/admin/UsersSection";

export default function AdminPage() {
  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-4">Admin Panel</h1>
      <p className="mb-8 text-lg text-gray-600 dark:text-gray-300">
        Manage teams and users for your organization.
      </p>
      <BoardsSection />
      <TeamsSection />
      <UsersSection />
    </AdminLayout>
  );
}
