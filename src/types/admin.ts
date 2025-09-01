// Shared types for admin components

export interface TeamOption {
  id: string;
  name: string;
}

export interface UserOption {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
}

export interface BoardOption {
  id: string;
  name: string;
}

// Admin entity interfaces
export interface AdminBoard {
  id: string;
  name: string;
  teams?: TeamOption[];
  columns?: { id?: string; name: string }[];
}

export interface AdminTeam {
  id: string;
  name: string;
  users?: Array<{ id: string; name: string }>;
  boards?: BoardOption[];
}

export interface AdminUser extends UserOption {
  role?: string;
}

// CRUD operation types
export interface CrudState<T> {
  items: T[];
  loading: boolean;
  error: string | null;
  showAdd: boolean;
  adding: boolean;
  addError: string | null;
  showEdit: boolean;
  editingItem: T | null;
  editing: boolean;
  editError: string | null;
  showDelete: boolean;
  deletingItem: T | null;
  deleting: boolean;
  deleteError: string | null;
}

export type CrudAction<T> =
  | { type: 'SET_ITEMS'; items: T[] }
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'SET_ERROR'; error: string | null }
  | { type: 'SHOW_ADD' }
  | { type: 'HIDE_ADD' }
  | { type: 'SET_ADDING'; adding: boolean }
  | { type: 'SET_ADD_ERROR'; error: string | null }
  | { type: 'ADD_ITEM'; item: T }
  | { type: 'SHOW_EDIT'; item: T }
  | { type: 'HIDE_EDIT' }
  | { type: 'SET_EDITING'; editing: boolean }
  | { type: 'SET_EDIT_ERROR'; error: string | null }
  | { type: 'UPDATE_ITEM'; item: T }
  | { type: 'SHOW_DELETE'; item: T }
  | { type: 'HIDE_DELETE' }
  | { type: 'SET_DELETING'; deleting: boolean }
  | { type: 'SET_DELETE_ERROR'; error: string | null }
  | { type: 'REMOVE_ITEM'; id: string };

// Form data interfaces
export interface CreateBoardForm {
  name: string;
  columns: { name: string }[];
  teamIds: string[];
}

export interface EditBoardForm {
  name: string;
  columns?: { id?: string; name: string }[];
  teamIds?: string[];
}

export interface CreateTeamForm {
  teamName: string;
  users: UserOption[];
}

export interface EditTeamForm {
  teamName: string;
  users: UserOption[];
  boards: BoardOption[];
}

export interface CreateUserForm {
  name: string;
  email: string;
  password: string;
  role: string;
}

export interface EditUserForm {
  name: string;
  email: string;
  avatar?: string;
}