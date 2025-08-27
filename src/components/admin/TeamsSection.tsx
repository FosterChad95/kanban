"use client";
import React, { useEffect, useReducer, useState } from "react";
import AddTeamModal, { UserOption } from "@/components/ui/Modal/AddTeamModal";
import EditTeamModal from "@/components/ui/Modal/EditTeamModal";
import DeleteModal from "@/components/ui/Modal/DeleteModal";

type Team = {
  id: string;
  name: string;
  users?: Array<{ id: string; name: string }>;
};

type TeamsState = {
  teams: Team[];
  loading: boolean;
  error: string | null;
  showAdd: boolean;
  adding: boolean;
  addError: string | null;
  showEdit: boolean;
  editingTeam: Team | null;
  editing: boolean;
  editError: string | null;
  showDelete: boolean;
  deletingTeam: Team | null;
  deleting: boolean;
  deleteError: string | null;
};

const initialTeamsState: TeamsState = {
  teams: [],
  loading: true,
  error: null,
  showAdd: false,
  adding: false,
  addError: null,
  showEdit: false,
  editingTeam: null,
  editing: false,
  editError: null,
  showDelete: false,
  deletingTeam: null,
  deleting: false,
  deleteError: null,
};

function teamsReducer(
  state: TeamsState,
  action: { type: string; [key: string]: any }
): TeamsState {
  switch (action.type) {
    case "SET_TEAMS":
      return { ...state, teams: action.teams };
    case "SET_LOADING":
      return { ...state, loading: action.loading };
    case "SET_ERROR":
      return { ...state, error: action.error };
    case "SHOW_ADD":
      return { ...state, showAdd: true };
    case "HIDE_ADD":
      return { ...state, showAdd: false, addError: null };
    case "SET_ADDING":
      return { ...state, adding: action.adding };
    case "SET_ADD_ERROR":
      return { ...state, addError: action.error };
    case "ADD_TEAM":
      return { ...state, teams: [...state.teams, action.team] };
    case "SHOW_EDIT":
      return { ...state, showEdit: true, editingTeam: action.team };
    case "HIDE_EDIT":
      return {
        ...state,
        showEdit: false,
        editingTeam: null,
        editError: null,
      };
    case "SET_EDITING":
      return { ...state, editing: action.editing };
    case "SET_EDIT_ERROR":
      return { ...state, editError: action.error };
    case "UPDATE_TEAM":
      return {
        ...state,
        teams: state.teams.map((t) =>
          t.id === action.team.id ? action.team : t
        ),
      };
    case "SHOW_DELETE":
      return { ...state, showDelete: true, deletingTeam: action.team };
    case "HIDE_DELETE":
      return {
        ...state,
        showDelete: false,
        deletingTeam: null,
        deleteError: null,
      };
    case "SET_DELETING":
      return { ...state, deleting: action.deleting };
    case "SET_DELETE_ERROR":
      return { ...state, deleteError: action.error };
    case "REMOVE_TEAM":
      return {
        ...state,
        teams: state.teams.filter((t) => t.id !== action.id),
      };
    default:
      return state;
  }
}

export default function TeamsSection() {
  const [teamsState, dispatchTeams] = useReducer(
    teamsReducer,
    initialTeamsState
  );
  const [users, setUsers] = useState<UserOption[]>([]);

  // Fetch teams
  useEffect(() => {
    async function fetchTeams() {
      dispatchTeams({ type: "SET_LOADING", loading: true });
      try {
        dispatchTeams({ type: "SET_ERROR", error: null });
        const res = await fetch("/api/teams");
        if (res.ok) {
          const data = await res.json();
          dispatchTeams({ type: "SET_TEAMS", teams: data });
        } else {
          dispatchTeams({ type: "SET_ERROR", error: "Failed to fetch teams." });
        }
      } catch (err) {
        dispatchTeams({
          type: "SET_ERROR",
          error: "An error occurred while fetching teams.",
        });
        // eslint-disable-next-line no-console
        console.error("Fetch teams error:", err);
      } finally {
        dispatchTeams({ type: "SET_LOADING", loading: false });
      }
    }
    fetchTeams();
  }, []);

  // Fetch users for AddTeamModal and EditTeamModal
  async function fetchUsers() {
    try {
      const res = await fetch("/api/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      } else {
        // keep users empty and log
        // eslint-disable-next-line no-console
        console.error("Failed to fetch users for teams");
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Fetch users error:", err);
    }
  }
  useEffect(() => {
    fetchUsers();
  }, []);

  // Handler for creating a new team
  async function handleCreateTeam(form: {
    teamName: string;
    users: UserOption[];
  }) {
    dispatchTeams({ type: "SET_ADDING", adding: true });
    try {
      dispatchTeams({ type: "SET_ADD_ERROR", error: null });
      const res = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.teamName,
          userIds: form.users.map((u) => u.id),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        dispatchTeams({ type: "ADD_TEAM", team: data });
        dispatchTeams({ type: "HIDE_ADD" });
      } else {
        dispatchTeams({
          type: "SET_ADD_ERROR",
          error: "Failed to create team.",
        });
      }
    } catch (err) {
      dispatchTeams({
        type: "SET_ADD_ERROR",
        error: "An error occurred while creating the team.",
      });
      // eslint-disable-next-line no-console
      console.error("Create team error:", err);
    } finally {
      dispatchTeams({ type: "SET_ADDING", adding: false });
    }
  }

  // Handler for editing a team
  async function handleEditTeam(form: {
    teamName: string;
    users: UserOption[];
  }) {
    if (!teamsState.editingTeam) return;
    dispatchTeams({ type: "SET_EDITING", editing: true });
    try {
      dispatchTeams({ type: "SET_EDIT_ERROR", error: null });
      const res = await fetch(`/api/teams/${teamsState.editingTeam.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.teamName,
          userIds: form.users.map((u) => u.id),
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        dispatchTeams({ type: "UPDATE_TEAM", team: updated });
        dispatchTeams({ type: "HIDE_EDIT" });
      } else {
        dispatchTeams({
          type: "SET_EDIT_ERROR",
          error: "Failed to update team.",
        });
      }
    } catch (err) {
      dispatchTeams({
        type: "SET_EDIT_ERROR",
        error: "An error occurred while updating the team.",
      });
      // eslint-disable-next-line no-console
      console.error("Edit team error:", err);
    } finally {
      dispatchTeams({ type: "SET_EDITING", editing: false });
    }
  }

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Teams</h2>
        {/* Add Team Button */}
        <button
          className="bg-main-purple text-white px-4 py-2 rounded hover:bg-main-purple-light transition-colors"
          onClick={() => dispatchTeams({ type: "SHOW_ADD" })}
        >
          + Add Team
        </button>
      </div>
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-6 bg-white dark:bg-gray-900 shadow">
        {teamsState.error && (
          <p className="text-center text-red-500 mb-2">{teamsState.error}</p>
        )}
        {teamsState.loading ? (
          <p className="text-center text-gray-500 dark:text-gray-400">
            Loading teams...
          </p>
        ) : teamsState.teams.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400">
            No teams found.
          </p>
        ) : (
          <ul>
            {teamsState.teams.map((team) => (
              <li
                key={team.id}
                className="py-2 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center"
              >
                <span>{team.name}</span>
                <div className="flex gap-2">
                  <button
                    className="text-blue-600 hover:underline"
                    onClick={() => {
                      dispatchTeams({ type: "SHOW_EDIT", team });
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="text-red-600 hover:underline"
                    onClick={() => {
                      dispatchTeams({ type: "SHOW_DELETE", team });
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
      {teamsState.showAdd && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              onClick={() => dispatchTeams({ type: "HIDE_ADD" })}
              aria-label="Close"
            >
              ×
            </button>
            <AddTeamModal
              users={users}
              onCreate={handleCreateTeam}
              multiUser={true}
            />
            {teamsState.addError && (
              <div className="absolute left-0 right-0 top-0 mt-2 flex justify-center z-20">
                <span className="bg-red-100 text-red-700 px-4 py-2 rounded shadow">
                  {teamsState.addError}
                </span>
              </div>
            )}
            {teamsState.adding && (
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
      {teamsState.editingTeam && (
        <EditTeamModal
          initialTeamName={teamsState.editingTeam.name}
          initialUsers={teamsState.editingTeam.users || []}
          users={users}
          onEdit={handleEditTeam}
          multiUser={true}
          isOpen={teamsState.showEdit}
          onClose={() => {
            dispatchTeams({ type: "HIDE_EDIT" });
          }}
        />
      )}
      {teamsState.editError && teamsState.showEdit && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="absolute left-0 right-0 top-0 mt-2 flex justify-center z-20 pointer-events-auto">
            <span className="bg-red-100 text-red-700 px-4 py-2 rounded shadow">
              {teamsState.editError}
            </span>
          </div>
        </div>
      )}
      {teamsState.editing && teamsState.showEdit && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 dark:bg-gray-900/60 z-10 pointer-events-auto">
            <span className="text-main-purple font-semibold">Saving...</span>
          </div>
        </div>
      )}

      {/* Delete Team Modal */}
      {teamsState.showDelete && teamsState.deletingTeam && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <DeleteModal
            type="team"
            name={teamsState.deletingTeam.name}
            open={teamsState.showDelete}
            onDelete={async () => {
              dispatchTeams({ type: "SET_DELETING", deleting: true });
              dispatchTeams({ type: "SET_DELETE_ERROR", error: null });
              try {
                const res = await fetch(
                  `/api/teams/${teamsState.deletingTeam!.id}`,
                  {
                    method: "DELETE",
                  }
                );
                if (res.ok) {
                  dispatchTeams({
                    type: "REMOVE_TEAM",
                    id: teamsState.deletingTeam!.id,
                  });
                  dispatchTeams({ type: "HIDE_DELETE" });
                } else {
                  dispatchTeams({
                    type: "SET_DELETE_ERROR",
                    error: "Failed to delete team.",
                  });
                }
              } catch (err) {
                dispatchTeams({
                  type: "SET_DELETE_ERROR",
                  error: "An error occurred while deleting the team.",
                });
                // eslint-disable-next-line no-console
                console.error("Delete team error:", err);
              } finally {
                dispatchTeams({ type: "SET_DELETING", deleting: false });
              }
            }}
            onCancel={() => {
              dispatchTeams({ type: "HIDE_DELETE" });
            }}
          />
          {teamsState.deleteError && (
            <div className="absolute left-0 right-0 top-0 mt-2 flex justify-center z-20">
              <span className="bg-red-100 text-red-700 px-4 py-2 rounded shadow">
                {teamsState.deleteError}
              </span>
            </div>
          )}
          {teamsState.deleting && (
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
