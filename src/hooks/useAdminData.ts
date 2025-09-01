import { useEffect, useState } from 'react';
import { TeamOption, UserOption, BoardOption } from '@/types/admin';
import { createApiOperations } from './useCrudOperations';

const teamsApi = createApiOperations('/api/teams');
const usersApi = createApiOperations('/api/users');
const boardsApi = createApiOperations('/api/boards');

/**
 * Hook for fetching teams data for dropdowns and selectors
 */
export function useTeamsData() {
  const [teams, setTeams] = useState<TeamOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await teamsApi.fetchAll<TeamOption>();
      setTeams(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch teams');
      console.error('Fetch teams error:', err);
    } finally {
      setLoading(false);
    }
  };

  return { teams, loading, error, refetch: fetchTeams };
}

/**
 * Hook for fetching users data for dropdowns and selectors
 */
export function useUsersData() {
  const [users, setUsers] = useState<UserOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await usersApi.fetchAll<UserOption>();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
      console.error('Fetch users error:', err);
    } finally {
      setLoading(false);
    }
  };

  return { users, loading, error, refetch: fetchUsers };
}

/**
 * Hook for fetching boards data for dropdowns and selectors
 */
export function useBoardsData() {
  const [boards, setBoards] = useState<BoardOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBoards();
  }, []);

  const fetchBoards = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await boardsApi.fetchAll<any[]>();
      // Transform to simple board options with just id and name
      const boardOptions = Array.isArray(data) 
        ? data.map(b => ({ id: b.id, name: b.name }))
        : [];
      setBoards(boardOptions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch boards');
      console.error('Fetch boards error:', err);
    } finally {
      setLoading(false);
    }
  };

  return { boards, loading, error, refetch: fetchBoards };
}

/**
 * Combined hook for all admin data dependencies
 */
export function useAdminData() {
  const teamsData = useTeamsData();
  const usersData = useUsersData();
  const boardsData = useBoardsData();

  const loading = teamsData.loading || usersData.loading || boardsData.loading;
  const hasError = teamsData.error || usersData.error || boardsData.error;

  const refetchAll = () => {
    teamsData.refetch();
    usersData.refetch();
    boardsData.refetch();
  };

  return {
    teams: teamsData.teams,
    users: usersData.users,
    boards: boardsData.boards,
    loading,
    hasError,
    refetchAll,
  };
}