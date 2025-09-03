import React from "react";

interface AdminSectionProps {
  title: string;
  onAdd: () => void;
  addButtonText: string;
  loading?: boolean;
  error?: string | null;
  children: React.ReactNode;
}

/**
 * Reusable admin section layout with header and error handling
 */
export function AdminSection({
  title,
  onAdd,
  addButtonText,
  loading = false,
  error = null,
  children,
}: AdminSectionProps) {
  return (
    <section className="mb-12">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
        <button
          className="bg-main-purple text-white px-4 py-2 rounded hover:bg-main-purple-light transition-colors disabled:opacity-50"
          onClick={onAdd}
          disabled={loading}
        >
          {addButtonText}
        </button>
      </div>

      {/* Section Content */}
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-6 bg-white dark:bg-gray-900 shadow">
        {/* Error Display */}
        {error && <p className="text-center text-red-500 mb-2">{error}</p>}

        {/* Loading State */}
        {loading ? (
          <p className="text-center text-gray-500 dark:text-gray-400">
            Loading {title.toLowerCase()}...
          </p>
        ) : (
          children
        )}
      </div>
    </section>
  );
}

interface ItemListProps<T extends { id: string; name: string }> {
  items: T[];
  onEdit: (item: T) => void;
  onDelete: (item: T) => void;
  renderItem?: (item: T) => React.ReactNode;
  emptyMessage?: string;
}

/**
 * Generic list component for admin items
 */
export function ItemList<T extends { id: string; name: string }>({
  items,
  onEdit,
  onDelete,
  renderItem,
  emptyMessage = "No items found.",
}: ItemListProps<T>) {
  if (items.length === 0) {
    return (
      <p className="text-center text-gray-500 dark:text-gray-400">
        {emptyMessage}
      </p>
    );
  }

  return (
    <ul>
      {items
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((item) => (
          <li
            key={item.id}
            className="py-2 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center"
          >
            {/* Custom item rendering or default */}
            {renderItem ? renderItem(item) : <span className="text-gray-900 dark:text-gray-100">{item.name}</span>}

            {/* Action buttons */}
            <div className="flex gap-2">
              <button
                className="text-blue-600 dark:text-blue-400 hover:underline"
                onClick={() => onEdit(item)}
              >
                Edit
              </button>
              <button
                className="text-red-600 dark:text-red-400 hover:underline"
                onClick={() => onDelete(item)}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
    </ul>
  );
}
