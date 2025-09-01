import React from 'react';
import { AdminUser } from '@/types/admin';

interface UserListItemProps {
  user: AdminUser;
  onEdit: (user: AdminUser) => void;
  onDelete: (user: AdminUser) => void;
}

/**
 * Enhanced user list item with avatar and additional user info
 */
export function UserListItem({ user, onEdit, onDelete }: UserListItemProps) {
  return (
    <div className="flex items-center gap-4 justify-between">
      {/* User Info */}
      <div className="flex items-center gap-4">
        {/* Avatar */}
        {user.avatar ? (
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
        
        {/* Name and Email */}
        <div className="flex flex-col">
          <span className="font-medium">{user.name}</span>
          {user.email && (
            <span className="text-gray-500 dark:text-gray-400 text-sm">
              {user.email}
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          className="text-blue-600 hover:underline"
          onClick={() => onEdit(user)}
        >
          Edit
        </button>
        <button
          className="text-red-600 hover:underline"
          onClick={() => onDelete(user)}
        >
          Delete
        </button>
      </div>
    </div>
  );
}