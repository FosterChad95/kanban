import React from 'react';

interface ModalOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  loading?: boolean;
  error?: string | null;
  loadingText?: string;
  children: React.ReactNode;
}

/**
 * Reusable modal overlay with error handling and loading states
 */
export function ModalOverlay({
  isOpen,
  onClose,
  loading = false,
  error = null,
  loadingText = "Processing...",
  children,
}: ModalOverlayProps) {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    // Only close if clicking the backdrop, not the modal content
    if (e.target === e.currentTarget && !loading) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50"
      onClick={handleBackdropClick}
    >
      <div className="relative">
        {/* Modal content */}
        {children}

        {/* Error display */}
        {error && (
          <div className="absolute left-0 right-0 top-0 mt-2 flex justify-center z-20">
            <span className="bg-red-100 text-red-700 px-4 py-2 rounded shadow">
              {error}
            </span>
          </div>
        )}

        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 dark:bg-gray-900/60 z-10 rounded-lg">
            <span className="text-main-purple font-semibold">
              {loadingText}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}