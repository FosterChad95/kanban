"use client";
import React, { useEffect, useState } from "react";
import AdminLayout from "@/components/content/AdminLayout";
import AddTeamModal, { UserOption } from "@/components/ui/Modal/AddTeamModal";
import EditTeamModal from "@/components/ui/Modal/EditTeamModal";
import DeleteModal from "@/components/ui/Modal/DeleteModal";
import AddUserModal from "@/components/ui/Modal/AddUserModal";

type Team = {
  id: string;
  name: string;
  users?: Array<{ id: string; name: string }>;
};

export default function AdminPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [showAddTeam, setShowAddTeam] = useState(false);
  const [adding, setAdding] = useState(false);

  // Edit team modal state
  const [showEditTeam, setShowEditTeam] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [editing, setEditing] = useState(false);
  const [editTeamError, setEditTeamError] = useState<string | null>(null);

  // Error states
  const [teamsError, setTeamsError] = useState<string | null>(null);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [addTeamError, setAddTeamError] = useState<string | null>(null);

  // Delete team modal state
  const [showDeleteTeam, setShowDeleteTeam] = useState(false);
  const [deletingTeam, setDeletingTeam] = useState<Team | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteTeamError, setDeleteTeamError] = useState<string | null>(null);

  // Add user modal state
  const [showAddUser, setShowAddUser] = useState(false);
  const [addingUser, setAddingUser] = useState(false);
  const [addUserError, setAddUserError] = useState<string | null>(null);

  // Fetch teams
  useEffect(() => {
    async function fetchTeams() {
      setLoading(true);
      try {
        setTeamsError(null);
        const res = await fetch("/api/teams");
        if (res.ok) {
          const data = await res.json();
          setTeams(data);
        } else {
          setTeamsError("Failed to fetch teams.");
        }
      } catch (err) {
        setTeamsError("An error occurred while fetching teams.");
        // eslint-disable-next-line no-console
        console.error("Fetch teams error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchTeams();
  }, []);

  // Fetch users for AddTeamModal
  useEffect(() => {
    async function fetchUsers() {
      try {
        setUsersError(null);
        const res = await fetch("/api/users");
        if (res.ok) {
          const data = await res.json();
          setUsers(data);
        } else {
          setUsersError("Failed to fetch users.");
        }
      } catch (err) {
        setUsersError("An error occurred while fetching users.");
        // eslint-disable-next-line no-console
        console.error("Fetch users error:", err);
      }
    }
    fetchUsers();
  }, []);

  // Handler for creating a new team
  async function handleCreateTeam(form: {
    teamName: string;
    users: UserOption[];
  }) {
    setAdding(true);
    try {
      setAddTeamError(null);
      const res = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.teamName,
          userIds: form.users.map((u) => u.id),
        }),
      });
      if (res.ok) {
        // Refresh teams list
        const data = await res.json();
        setTeams((prev) => [...prev, data]);
        setShowAddTeam(false);
      } else {
        setAddTeamError("Failed to create team.");
      }
    } catch (err) {
      setAddTeamError("An error occurred while creating the team.");
      // eslint-disable-next-line no-console
      console.error("Create team error:", err);
    } finally {
      setAdding(false);
    }
  }

  // Handler for editing a team
  async function handleEditTeam(form: {
    teamName: string;
    users: UserOption[];
  }) {
    if (!editingTeam) return;
    setEditing(true);
    try {
      setEditTeamError(null);
      const res = await fetch(`/api/teams/${editingTeam.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.teamName,
          userIds: form.users.map((u) => u.id),
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setTeams((prev) =>
          prev.map((t) => (t.id === updated.id ? updated : t))
        );
        setShowEditTeam(false);
        setEditingTeam(null);
      } else {
        setEditTeamError("Failed to update team.");
      }
    } catch (err) {
      setEditTeamError("An error occurred while updating the team.");
      // eslint-disable-next-line no-console
      console.error("Edit team error:", err);
    } finally {
      setEditing(false);
    }
  }

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-4">Admin Panel</h1>
      <p className="mb-8 text-lg text-gray-600 dark:text-gray-300">
        Manage teams and users for your organization.
      </p>
      <section className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Teams</h2>
          {/* Add Team Button */}
          <button
            className="bg-main-purple text-white px-4 py-2 rounded hover:bg-main-purple-light transition-colors"
            onClick={() => setShowAddTeam(true)}
          >
            + Add Team
          </button>
        </div>
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-6 bg-white dark:bg-gray-900 shadow">
          {teamsError && (
            <p className="text-center text-red-500 mb-2">{teamsError}</p>
          )}
          {loading ? (
            <p className="text-center text-gray-500 dark:text-gray-400">
              Loading teams...
            </p>
          ) : teams.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400">
              No teams found.
            </p>
          ) : (
            <ul>
              {teams.map((team) => (
                <li
                  key={team.id}
                  className="py-2 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center"
                >
                  <span>{team.name}</span>
                  <div className="flex gap-2">
                    <button
                      className="text-blue-600 hover:underline"
                      onClick={() => {
                        setEditingTeam(team);
                        setShowEditTeam(true);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-600 hover:underline"
                      onClick={() => {
                        setDeletingTeam(team);
                        setShowDeleteTeam(true);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        {/* Add Team Modal */}
        {showAddTeam && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
            <div className="relative">
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                onClick={() => setShowAddTeam(false)}
                aria-label="Close"
              >
                ×
              </button>
              <AddTeamModal
                users={users}
                onCreate={handleCreateTeam}
                multiUser={true}
              />
              {addTeamError && (
                <div className="absolute left-0 right-0 top-0 mt-2 flex justify-center z-20">
                  <span className="bg-red-100 text-red-700 px-4 py-2 rounded shadow">
                    {addTeamError}
                  </span>
                </div>
              )}
              {adding && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/60 dark:bg-gray-900/60 z-10">
                  <span className="text-main-purple font-semibold">
                    Creating...
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
        {/* Edit Team Modal */}
        {editingTeam && (
          <EditTeamModal
            initialTeamName={editingTeam.name}
            initialUsers={editingTeam.users || []}
            users={users}
            onEdit={handleEditTeam}
            multiUser={true}
            isOpen={showEditTeam}
            onClose={() => {
              setShowEditTeam(false);
              setEditingTeam(null);
            }}
          />
        )}
        {editTeamError && showEditTeam && (
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
            <div className="absolute left-0 right-0 top-0 mt-2 flex justify-center z-20 pointer-events-auto">
              <span className="bg-red-100 text-red-700 px-4 py-2 rounded shadow">
                {editTeamError}
              </span>
            </div>
          </div>
        )}
        {editing && showEditTeam && (
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
            <div className="absolute inset-0 flex items-center justify-center bg-white/60 dark:bg-gray-900/60 z-10 pointer-events-auto">
              <span className="text-main-purple font-semibold">Saving...</span>
            </div>
          </div>
        )}
        {/* Delete Team Modal */}
        {showDeleteTeam && deletingTeam && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
            <DeleteModal
              type="team"
              name={deletingTeam.name}
              open={showDeleteTeam}
              onDelete={async () => {
                setDeleting(true);
                setDeleteTeamError(null);
                try {
                  const res = await fetch(`/api/teams/${deletingTeam.id}`, {
                    method: "DELETE",
                  });
                  if (res.ok) {
                    setTeams((prev) =>
                      prev.filter((t) => t.id !== deletingTeam.id)
                    );
                    setShowDeleteTeam(false);
                    setDeletingTeam(null);
                  } else {
                    setDeleteTeamError("Failed to delete team.");
                  }
                } catch (err) {
                  setDeleteTeamError(
                    "An error occurred while deleting the team."
                  );
                  // eslint-disable-next-line no-console
                  console.error("Delete team error:", err);
                } finally {
                  setDeleting(false);
                }
              }}
              onCancel={() => {
                setShowDeleteTeam(false);
                setDeletingTeam(null);
                setDeleteTeamError(null);
              }}
            />
            {deleteTeamError && (
              <div className="absolute left-0 right-0 top-0 mt-2 flex justify-center z-20">
                <span className="bg-red-100 text-red-700 px-4 py-2 rounded shadow">
                  {deleteTeamError}
                </span>
              </div>
            )}
            {deleting && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/60 dark:bg-gray-900/60 z-10">
                <span className="text-main-purple font-semibold">
                  Deleting...
                </span>
              </div>
            )}
          </div>
        )}
      </section>
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Users</h2>
          {/* Add User Button */}
          <button
            className="bg-main-purple text-white px-4 py-2 rounded hover:bg-main-purple-light transition-colors"
            onClick={() => setShowAddUser(true)}
          >
            + Add User
          </button>
        </div>
        {/* Users list placeholder */}
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-6 bg-white dark:bg-gray-900 shadow">
          {usersError && (
            <p className="text-center text-red-500 mb-2">{usersError}</p>
          )}
          <p className="text-center text-gray-500 dark:text-gray-400">
            Users management UI coming soon.
          </p>
        </div>
        {/* Add User Modal */}
        <AddUserModal
          isOpen={showAddUser}
          onClose={() => setShowAddUser(false)}
          onCreate={async (form) => {
            setAddingUser(true);
            setAddUserError(null);
            try {
              const res = await fetch("/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
              });
              if (res.ok) {
                // Optionally refresh users list here
                setShowAddUser(false);
              } else {
                setAddUserError("Failed to create user.");
              }
            } catch (err) {
              setAddUserError("An error occurred while creating the user.");
              // eslint-disable-next-line no-console
              console.error("Create user error:", err);
            } finally {
              setAddingUser(false);
            }
          }}
          loading={addingUser}
          error={addUserError}
        />
      </section>
    </AdminLayout>
  );
}
