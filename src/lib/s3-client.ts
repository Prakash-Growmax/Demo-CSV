import { CSVPreviewData, FileMetadata, PreviewError } from "@/types/csv";
// 

import {
  GetObjectCommand,
  HeadObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import Papa from "papaparse";

const BUCKET_NAME = import.meta.env.VITE_S3_BUCKET_NAME;

const s3Client = new S3Client({
  region: import.meta.env.VITE_S3_REGION,
  credentials: {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY,
  },
});
export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}
export class S3UploadError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = "S3UploadError";
  }
}

export async function uploadToS3(
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<string> {
  try {
    const Key = `analytics/${file.name}`;
    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: BUCKET_NAME,
        Key,
        Body: file,
        ContentType: file.type,
      },
    });

    // Add progress listener
    upload.on("httpUploadProgress", (progress) => {
      if (progress.loaded && progress.total) {
        const uploadProgress: UploadProgress = {
          loaded: progress.loaded,
          total: progress.total,
          percentage: Math.round((progress.loaded * 100) / progress.total),
        };
        onProgress?.(uploadProgress);
      }
    });
    //working....
    // const params = {
    //   Bucket: "growmax-dev-app-assets",
    //   Key: `analytics/${file.name}`,
    //   Body: file,
    //   ContentType: file.type,
    // };

    // const command = new PutObjectCommand(params);
    // const response = await s3Client.send(command);

    await upload.done();
    return Key;
  } catch (error) {
    console.error("S3 upload error:", error);
    if (error instanceof S3UploadError) {
      throw error;
    }
    throw new S3UploadError("Failed to upload file to S3");
  }
}

const PREVIEW_ROWS = 20;
// const TIMEOUT = 30000; // 30 seconds
const previewCache = new Map<
  string,
  { data: CSVPreviewData; timestamp: number }
>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const getFileMetadata = async (
  bucket: string,
  key: string
): Promise<FileMetadata> => {
  const command = new HeadObjectCommand({ Bucket: bucket, Key: key });
  const response = await s3Client.send(command);

  return {
    filename: key.split("/").pop() || key,
    size: response.ContentLength || 0,
    lastModified: response.LastModified || new Date(),
  };
};

export const fetchCSVPreview = async (
  bucket: string,
  key: string
): Promise<{ data: CSVPreviewData; metadata: FileMetadata }> => {
  const cacheKey = `${bucket}:${key}`;
  const cached = previewCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return { data: cached.data, metadata: await getFileMetadata(bucket, key) };
  }

  try {
    const command = new GetObjectCommand({ Bucket: bucket, Key: key });
    const response = await s3Client.send(command);

    if (!response.Body) {
      throw new Error("No data received from S3");
    }

    const csvString = await response.Body.transformToString();
    const parseResult = await new Promise<Papa.ParseResult<string[]>>(
      (resolve) => {
        Papa.parse(csvString, {
          preview: PREVIEW_ROWS,
          complete: resolve,
        });
      }
    );

    const previewData: CSVPreviewData = {
      headers: parseResult.data[0],
      rows: parseResult.data.slice(1),
      totalRows: parseResult.data.length - 1,
    };

    previewCache.set(cacheKey, {
      data: previewData,
      timestamp: Date.now(),
    });

    const metadata: FileMetadata = {
      filename: key.split("/").pop() || key,
      size: response.ContentLength || 0,
      lastModified: response.LastModified || new Date(),
    };

    return { data: previewData, metadata };
  } catch (error) {
    const previewError: PreviewError = {
      message: "Failed to fetch CSV preview",
      code: (error as any).code,
    };
    throw previewError;
  }
};
