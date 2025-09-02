"use client";
import React from "react";
import AddUserModal from "@/components/ui/Modal/AddUserModal";
import EditUserModal from "@/components/ui/Modal/EditUserModal";
import DeleteModal from "@/components/ui/Modal/DeleteModal";
import { AdminSection } from "./shared/AdminSection";
import { ModalOverlay } from "./shared/ModalOverlay";
import { UserListItem } from "./shared/UserListItem";
import { useUsers } from "@/hooks/useUsers";
import { CreateUserForm, EditUserForm } from "@/types/admin";

/**
 * Admin section for managing users with CRUD operations
 */
export default function UsersSection() {
  const {
    // State
    users,
    loading,
    error,
    // Add state
    showAdd,
    adding,
    addError,
    // Edit state
    showEdit,
    editingUser,
    editing,
    editError,
    // Delete state
    showDelete,
    deletingUser,
    deleting,
    deleteError,
    // Actions
    showAddModal,
    hideAddModal,
    showEditModal,
    hideEditModal,
    showDeleteModal,
    hideDeleteModal,
    // CRUD operations
    createUser,
    updateUser,
    deleteUser,
  } = useUsers();

  /**
   * Handle user creation
   */
  const handleCreateUser = async (formData: CreateUserForm) => {
    await createUser(formData);
  };

  /**
   * Handle user update
   */
  const handleUpdateUser = async (formData: EditUserForm) => {
    if (!editingUser) return;
    await updateUser(editingUser.id, formData);
  };

  /**
   * Handle user deletion
   */
  const handleDeleteUser = async () => {
    if (!deletingUser) return;
    await deleteUser(deletingUser.id);
  };

  /**
   * Render user list with enhanced styling
   */
  const renderUserList = () => {
    if (users.length === 0) {
      return (
        <p className="text-center text-gray-500 dark:text-gray-400">
          No users found.
        </p>
      );
    }

    return (
      <ul>
        {users
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((user) => (
            <li
              key={user.id}
              className="py-3 border-b border-gray-100 dark:border-gray-800 last:border-b-0"
            >
              <UserListItem
                user={user}
                onEdit={showEditModal}
                onDelete={showDeleteModal}
              />
            </li>
          ))}
      </ul>
    );
  };

  return (
    <>
      <AdminSection
        title="Users"
        addButtonText="+ Add User"
        onAdd={showAddModal}
        loading={loading}
        error={error}
      >
        {renderUserList()}
      </AdminSection>

      {/* Add User Modal */}
      {showAdd && (
        <AddUserModal
          isOpen={showAdd}
          onClose={hideAddModal}
          onCreate={handleCreateUser}
          loading={adding}
          error={addError}
        />
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <EditUserModal
          initialName={editingUser.name}
          initialEmail={editingUser.email || ""}
          initialAvatar={editingUser.avatar || ""}
          isOpen={showEdit}
          onClose={hideEditModal}
          onEdit={handleUpdateUser}
          loading={editing}
          error={editError}
        />
      )}

      {/* Delete User Modal */}
      <ModalOverlay
        isOpen={showDelete}
        onClose={hideDeleteModal}
        loading={deleting}
        error={deleteError}
        loadingText="Deleting..."
      >
        {deletingUser && (
          <DeleteModal
            type="user"
            name={deletingUser.name}
            isOpen={showDelete}
            onClose={hideDeleteModal}
            open={showDelete}
            onDelete={handleDeleteUser}
            onCancel={hideDeleteModal}
          />
        )}
      </ModalOverlay>
    </>
  );
}