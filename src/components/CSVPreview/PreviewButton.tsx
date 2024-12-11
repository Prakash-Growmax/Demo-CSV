import { Eye } from "lucide-react";
import React from "react";

interface PreviewButtonProps {
  onClick: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export const PreviewButton: React.FC<PreviewButtonProps> = ({
  onClick,
  isLoading = false,
  disabled = false,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      aria-label="Preview CSV file"
    >
      {isLoading ? (
        <div className="animate-spin -ml-1 mr-2 h-4 w-4 text-white">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
      ) : (
        <Eye className="h-4 w-4 mr-2" aria-hidden="true" />
      )}
      Preview CSV
    </button>
  );
};
