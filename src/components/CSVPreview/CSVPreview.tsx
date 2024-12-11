import React, { useState } from "react";
import { fetchCSVPreview } from "../../lib/s3-client";
import { CSVPreviewData, FileMetadata, PreviewError } from "../../types/csv";
import { PreviewButton } from "./PreviewButton";
import { PreviewModal } from "./PreviewModel";

interface CSVPreviewProps {
  bucket: string;
  s3Key: string;
}

export const CSVPreview: React.FC<CSVPreviewProps> = ({ bucket, s3Key }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<PreviewError | null>(null);
  const [previewData, setPreviewData] = useState<CSVPreviewData | null>(null);
  const [metadata, setMetadata] = useState<FileMetadata | null>(null);

  const handlePreviewClick = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, metadata } = await fetchCSVPreview(bucket, s3Key);
      setPreviewData(data);
      setMetadata(metadata);
      setIsModalOpen(true);
    } catch (err) {
      setError(err as PreviewError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <PreviewButton
        onClick={handlePreviewClick}
        isLoading={isLoading}
        disabled={isLoading}
      />

      {error && (
        <div className="mt-2 text-sm text-red-600" role="alert">
          {error.message}
          {error.code && ` (${error.code})`}
        </div>
      )}

      {previewData && metadata && (
        <PreviewModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          data={previewData}
          metadata={metadata}
        />
      )}
    </div>
  );
};
