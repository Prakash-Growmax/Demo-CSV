import { X } from "lucide-react";
import React from "react";
import { CSVPreviewData, FileMetadata } from "../../types/csv";

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: CSVPreviewData;
  metadata: FileMetadata;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({
  isOpen,
  onClose,
  data,
  metadata,
}) => {
  if (!isOpen) return null;

  const formatFileSize = (bytes: number): string => {
    const units = ["B", "KB", "MB", "GB"];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 bg-gray-500/75 backdrop-blur-sm transition-opacity"
          aria-hidden="true"
          onClick={onClose}
        />

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:mt-8 sm:align-middle sm:max-w-7xl sm:w-full ring-1 ring-gray-900/5">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 h-[95vh]">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h3
                  className="text-xl leading-7 font-semibold text-gray-900 font-sans"
                  id="modal-title"
                >
                  {metadata.filename}
                </h3>
                <div className="max-h-[calc(100vh-200px)] overflow-auto">
                  <div className="text-sm text-gray-600 flex items-center gap-3 font-medium flex-wrap">
                    <span className="flex items-center gap-1.5">
                      <span className="font-normal text-gray-500">Size:</span>
                      {formatFileSize(metadata.size)}
                    </span>
                    <span className="text-gray-300">•</span>
                    <span className="flex items-center gap-1.5">
                      <span className="font-normal text-gray-500">
                        Modified:
                      </span>
                      {formatDate(metadata.lastModified)}
                    </span>
                    <span className="text-gray-300">•</span>
                    <span className="flex items-center gap-1.5">
                      <span className="font-normal text-gray-500">Rows:</span>
                      {data.totalRows.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-label="Close preview"
              >
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-6 border rounded-lg overflow-hidden border-gray-200 h-[90%]">
              <div className="overflow-x-auto h-[100%]">
                <table className="min-w-full divide-y divide-gray-200 h-[100%]">
                  <thead className="bg-gray-50">
                    <tr>
                      {data.headers.map((header, index) => (
                        <th
                          key={index}
                          scope="col"
                          className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap bg-gray-50/80"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.rows.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {row.map((cell, cellIndex) => (
                          <td
                            key={cellIndex}
                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-normal"
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
