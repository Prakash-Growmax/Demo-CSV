import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";

const s3Client = new S3Client({
  region: "ap-northeast-1",
  credentials: {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET_NAME = "growmax-dev-app-assets";
const MULTIPART_THRESHOLD = 5 * 1024 * 1024; // 5MB

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
