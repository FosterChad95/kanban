import { useReducer, useMemo } from 'react';
import { CrudState, CrudAction } from '@/types/admin';

/**
 * Generic reducer for CRUD operations
 */
export function crudReducer<T extends { id: string }>(
  state: CrudState<T>,
  action: CrudAction<T>
): CrudState<T> {
  switch (action.type) {
    case 'SET_ITEMS':
      return { ...state, items: action.items, loading: false };
    case 'SET_LOADING':
      return { ...state, loading: action.loading };
    case 'SET_ERROR':
      return { ...state, error: action.error, loading: false };
    
    // Add operations
    case 'SHOW_ADD':
      return { ...state, showAdd: true };
    case 'HIDE_ADD':
      return { ...state, showAdd: false, addError: null };
    case 'SET_ADDING':
      return { ...state, adding: action.adding };
    case 'SET_ADD_ERROR':
      return { ...state, addError: action.error };
    case 'ADD_ITEM':
      return { 
        ...state, 
        items: [...state.items, action.item],
        showAdd: false,
        adding: false,
        addError: null
      };
    
    // Edit operations
    case 'SHOW_EDIT':
      return { ...state, showEdit: true, editingItem: action.item };
    case 'HIDE_EDIT':
      return { 
        ...state, 
        showEdit: false, 
        editingItem: null, 
        editError: null 
      };
    case 'SET_EDITING':
      return { ...state, editing: action.editing };
    case 'SET_EDIT_ERROR':
      return { ...state, editError: action.error };
    case 'UPDATE_ITEM':
      return {
        ...state,
        items: state.items.map(item => 
          item.id === action.item.id ? action.item : item
        ),
        showEdit: false,
        editing: false,
        editingItem: null,
        editError: null
      };
    
    // Delete operations
    case 'SHOW_DELETE':
      return { ...state, showDelete: true, deletingItem: action.item };
    case 'HIDE_DELETE':
      return { 
        ...state, 
        showDelete: false, 
        deletingItem: null, 
        deleteError: null 
      };
    case 'SET_DELETING':
      return { ...state, deleting: action.deleting };
    case 'SET_DELETE_ERROR':
      return { ...state, deleteError: action.error };
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.id),
        showDelete: false,
        deleting: false,
        deletingItem: null,
        deleteError: null
      };
    
    default:
      return state;
  }
}

/**
 * Generic CRUD operations hook
 */
export function useCrudOperations<T extends { id: string }>(initialItems: T[] = []) {
  const initialState: CrudState<T> = {
    items: initialItems,
    loading: true,
    error: null,
    showAdd: false,
    adding: false,
    addError: null,
    showEdit: false,
    editingItem: null,
    editing: false,
    editError: null,
    showDelete: false,
    deletingItem: null,
    deleting: false,
    deleteError: null,
  };

  const [state, dispatch] = useReducer(crudReducer<T>, initialState);

  const actions = useMemo(() => ({
    // Basic state management
    setItems: (items: T[]) => dispatch({ type: 'SET_ITEMS', items }),
    setLoading: (loading: boolean) => dispatch({ type: 'SET_LOADING', loading }),
    setError: (error: string | null) => dispatch({ type: 'SET_ERROR', error }),

    // Add operations
    showAdd: () => dispatch({ type: 'SHOW_ADD' }),
    hideAdd: () => dispatch({ type: 'HIDE_ADD' }),
    setAdding: (adding: boolean) => dispatch({ type: 'SET_ADDING', adding }),
    setAddError: (error: string | null) => dispatch({ type: 'SET_ADD_ERROR', error }),
    addItem: (item: T) => dispatch({ type: 'ADD_ITEM', item }),

    // Edit operations  
    showEdit: (item: T) => dispatch({ type: 'SHOW_EDIT', item }),
    hideEdit: () => dispatch({ type: 'HIDE_EDIT' }),
    setEditing: (editing: boolean) => dispatch({ type: 'SET_EDITING', editing }),
    setEditError: (error: string | null) => dispatch({ type: 'SET_EDIT_ERROR', error }),
    updateItem: (item: T) => dispatch({ type: 'UPDATE_ITEM', item }),

    // Delete operations
    showDelete: (item: T) => dispatch({ type: 'SHOW_DELETE', item }),
    hideDelete: () => dispatch({ type: 'HIDE_DELETE' }),
    setDeleting: (deleting: boolean) => dispatch({ type: 'SET_DELETING', deleting }),
    setDeleteError: (error: string | null) => dispatch({ type: 'SET_DELETE_ERROR', error }),
    removeItem: (id: string) => dispatch({ type: 'REMOVE_ITEM', id }),
  }), [dispatch]);

  return { state, actions };
}

/**
 * Generic API operations
 */
export const createApiOperations = (baseUrl: string) => ({
  async fetchAll<T>(): Promise<T[]> {
    const response = await fetch(baseUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${baseUrl}`);
    }
    return response.json();
  },

  async fetchById<T>(id: string): Promise<T> {
    const response = await fetch(`${baseUrl}/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${baseUrl}/${id}`);
    }
    return response.json();
  },

  async create<TRequest, TResponse>(data: TRequest): Promise<TResponse> {
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData?.error || `Failed to create resource`);
    }
    return response.json();
  },

  async update<TRequest, TResponse>(id: string, data: TRequest): Promise<TResponse> {
    const response = await fetch(`${baseUrl}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData?.error || `Failed to update resource`);
    }
    return response.json();
  },

  async delete(id: string): Promise<void> {
    const response = await fetch(`${baseUrl}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData?.error || `Failed to delete resource`);
    }
  },
});