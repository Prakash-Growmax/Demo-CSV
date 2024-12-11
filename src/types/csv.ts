export interface CSVPreviewData {
  headers: string[];
  rows: string[][];
  totalRows: number;
}

export interface FileMetadata {
  filename: string;
  size: number;
  lastModified: Date;
}

export interface PreviewError {
  message: string;
  code?: string;
}
