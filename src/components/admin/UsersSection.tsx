"use client";
import React, { useEffect, useReducer } from "react";
import AddUserModal from "@/components/ui/Modal/AddUserModal";
import EditUserModal from "@/components/ui/Modal/EditUserModal";
import DeleteModal from "@/components/ui/Modal/DeleteModal";
import { UserOption } from "@/components/ui/Modal/AddTeamModal";

type UsersState = {
  users: UserOption[];
  error: string | null;
  showAdd: boolean;
  adding: boolean;
  addError: string | null;
  showEdit: boolean;
  editingUser: UserOption | null;
  editing: boolean;
  editError: string | null;
  showDelete: boolean;
  deletingUser: UserOption | null;
  deleting: boolean;
  deleteError: string | null;
};

const initialUsersState: UsersState = {
  users: [],
  error: null,
  showAdd: false,
  adding: false,
  addError: null,
  showEdit: false,
  editingUser: null,
  editing: false,
  editError: null,
  showDelete: false,
  deletingUser: null,
  deleting: false,
  deleteError: null,
};

function usersReducer(
  state: UsersState,
  action: { type: string; [key: string]: unknown }
): UsersState {
  switch (action.type) {
    case "SET_USERS":
      return { ...state, users: action.users as UserOption[] };
    case "SET_ERROR":
      return { ...state, error: action.error as string | null };
    case "SHOW_ADD":
      return { ...state, showAdd: true };
    case "HIDE_ADD":
      return { ...state, showAdd: false, addError: null };
    case "SET_ADDING":
      return { ...state, adding: action.adding as boolean };
    case "SET_ADD_ERROR":
      return { ...state, addError: action.error as string | null };
    case "SHOW_EDIT":
      return {
        ...state,
        showEdit: true,
        editingUser: action.user as UserOption,
      };
    case "HIDE_EDIT":
      return { ...state, showEdit: false, editingUser: null, editError: null };
    case "SET_EDITING":
      return { ...state, editing: action.editing as boolean };
    case "SET_EDIT_ERROR":
      return { ...state, editError: action.error as string | null };
    case "SHOW_DELETE":
      return {
        ...state,
        showDelete: true,
        deletingUser: action.user as UserOption,
      };
    case "HIDE_DELETE":
      return {
        ...state,
        showDelete: false,
        deletingUser: null,
        deleteError: null,
      };
    case "SET_DELETING":
      return { ...state, deleting: action.deleting as boolean };
    case "SET_DELETE_ERROR":
      return { ...state, deleteError: action.error as string | null };
    default:
      return state;
  }
}

export default function UsersSection() {
  const [state, dispatch] = useReducer(usersReducer, initialUsersState);

  async function fetchUsers() {
    try {
      dispatch({ type: "SET_ERROR", error: null });
      const res = await fetch("/api/users");

      if (res.ok) {
        const data = await res.json();

        dispatch({ type: "SET_USERS", users: data });
      } else {
        dispatch({ type: "SET_ERROR", error: "Failed to fetch users." });
      }
    } catch (err) {
      dispatch({
        type: "SET_ERROR",
        error: "An error occurred while fetching users.",
      });
      // eslint-disable-next-line no-console
      console.error("Fetch users error:", err);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Users</h2>
        <button
          className="bg-main-purple text-white px-4 py-2 rounded hover:bg-main-purple-light transition-colors"
          onClick={() => dispatch({ type: "SHOW_ADD" })}
        >
          + Add User
        </button>
      </div>

      <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-6 bg-white dark:bg-gray-900 shadow">
        {state.error && (
          <p className="text-center text-red-500 mb-2">{state.error}</p>
        )}
        {state.users.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400">
            No users found.
          </p>
        ) : (
          <ul>
            {state.users.map((user) => (
              <li
                key={user.id}
                className="py-2 border-b border-gray-100 dark:border-gray-800 flex items-center gap-4 justify-between"
              >
                <div className="flex items-center gap-4">
                  {user.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="font-medium">{user.name}</span>
                  {user.email && (
                    <span className="text-gray-500 dark:text-gray-400 text-sm">
                      {user.email}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    className="text-blue-600 hover:underline"
                    onClick={() => dispatch({ type: "SHOW_EDIT", user })}
                  >
                    Edit
                  </button>
                  <button
                    className="text-red-600 hover:underline"
                    onClick={() => dispatch({ type: "SHOW_DELETE", user })}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Add User Modal */}
      {state.showAdd && (
        <AddUserModal
          isOpen={state.showAdd}
          onClose={() => dispatch({ type: "HIDE_ADD" })}
          onCreate={async (form) => {
            dispatch({ type: "SET_ADDING", adding: true });
            dispatch({ type: "SET_ADD_ERROR", error: null });
            try {
              const res = await fetch("/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
              });
              if (res.ok) {
                dispatch({ type: "HIDE_ADD" });
                fetchUsers();
              } else {
                dispatch({
                  type: "SET_ADD_ERROR",
                  error: "Failed to create user.",
                });
              }
            } catch (err) {
              dispatch({
                type: "SET_ADD_ERROR",
                error: "An error occurred while creating the user.",
              });
              // eslint-disable-next-line no-console
              console.error("Create user error:", err);
            } finally {
              dispatch({ type: "SET_ADDING", adding: false });
            }
          }}
          loading={state.adding}
          error={state.addError}
        />
      )}

      {/* Edit User Modal */}
      {state.editingUser && (
        <EditUserModal
          initialName={state.editingUser.name}
          initialEmail={state.editingUser.email || ""}
          initialAvatar={state.editingUser.avatar || ""}
          isOpen={state.showEdit}
          onClose={() => dispatch({ type: "HIDE_EDIT" })}
          onEdit={async (form) => {
            if (!state.editingUser) return;
            dispatch({ type: "SET_EDITING", editing: true });
            dispatch({ type: "SET_EDIT_ERROR", error: null });
            try {
              const res = await fetch(`/api/users/${state.editingUser.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
              });
              if (res.ok) {
                dispatch({ type: "HIDE_EDIT" });
                fetchUsers();
              } else {
                dispatch({
                  type: "SET_EDIT_ERROR",
                  error: "Failed to update user.",
                });
              }
            } catch (err) {
              dispatch({
                type: "SET_EDIT_ERROR",
                error: "An error occurred while updating the user.",
              });
              // eslint-disable-next-line no-console
              console.error("Edit user error:", err);
            } finally {
              dispatch({ type: "SET_EDITING", editing: false });
            }
          }}
          loading={state.editing}
          error={state.editError}
        />
      )}

      {state.editError && state.showEdit && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="absolute left-0 right-0 top-0 mt-2 flex justify-center z-20 pointer-events-auto">
            <span className="bg-red-100 text-red-700 px-4 py-2 rounded shadow">
              {state.editError}
            </span>
          </div>
        </div>
      )}

      {state.editing && state.showEdit && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 dark:bg-gray-900/60 z-10 pointer-events-auto">
            <span className="text-main-purple font-semibold">Saving...</span>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {state.showDelete && state.deletingUser && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <DeleteModal
            type="user"
            name={state.deletingUser ? state.deletingUser.name : ""}
            open={state.showDelete}
            onDelete={async () => {
              if (!state.deletingUser) return;
              dispatch({ type: "SET_DELETING", deleting: true });
              dispatch({ type: "SET_DELETE_ERROR", error: null });
              try {
                const res = await fetch(`/api/users/${state.deletingUser.id}`, {
                  method: "DELETE",
                });
                if (res.ok) {
                  dispatch({ type: "HIDE_DELETE" });
                  fetchUsers();
                } else {
                  dispatch({
                    type: "SET_DELETE_ERROR",
                    error: "Failed to delete user.",
                  });
                }
              } catch (err) {
                dispatch({
                  type: "SET_DELETE_ERROR",
                  error: "An error occurred while deleting the user.",
                });
                // eslint-disable-next-line no-console
                console.error("Delete user error:", err);
              } finally {
                dispatch({ type: "SET_DELETING", deleting: false });
              }
            }}
            onCancel={() => {
              dispatch({ type: "HIDE_DELETE" });
            }}
          />
          {state.deleteError && (
            <div className="absolute left-0 right-0 top-0 mt-2 flex justify-center z-20">
              <span className="bg-red-100 text-red-700 px-4 py-2 rounded shadow">
                {state.deleteError}
              </span>
            </div>
          )}
          {state.deleting && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/60 dark:bg-gray-900/60 z-10">
              <span className="text-main-purple font-semibold">
                Deleting...
              </span>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
