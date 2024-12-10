import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { S3UploadError, UploadProgress, uploadToS3 } from "@/lib/s3-client";
import { motion } from "framer-motion";
import { AlertCircle, FileText, Upload } from "lucide-react";
import { useCallback, useState } from "react";

interface FileUploadProps {
  onFileUploaded: (s3Key: string) => void;
  onError: (error: string) => void;
}

export function FileUpload({ onFileUploaded, onError }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(
    null
  );
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      setFileName(file.name);
      setIsUploading(true);
      setError(null);

      try {
        const s3Key = await uploadToS3(file, (progress) => {
          setUploadProgress(progress);
        });

        onFileUploaded(s3Key);
      } catch (error) {
        if (error instanceof S3UploadError) {
          setError(error.message);
          onError(error.message);
        } else {
          setError("An unexpected error occurred");
          onError("An unexpected error occurred");
        }
      } finally {
        setIsUploading(false);
        setUploadProgress(null);
      }
    },
    [onFileUploaded, onError]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md"
    >
      <Card className="p-8">
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            {fileName ? (
              <FileText className="h-8 w-8 text-primary" />
            ) : (
              <Upload className="h-8 w-8 text-primary" />
            )}
          </div>

          <div className="space-y-2 text-center">
            <h3 className="text-xl font-semibold">Upload CSV File</h3>
            <p className="text-sm text-muted-foreground">
              {fileName || "Upload your CSV file to start analyzing"}
            </p>
          </div>

          {uploadProgress && (
            <div className="w-full space-y-2">
              <Progress value={uploadProgress.percentage} />
              <p className="text-sm text-center text-muted-foreground">
                Uploading... {uploadProgress.percentage}%
              </p>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
              id="csv-upload"
              disabled={isUploading}
            />
            <Button
              disabled={isUploading}
              onClick={() => document.getElementById("csv-upload")?.click()}
              size="lg"
            >
              {isUploading
                ? "Uploading..."
                : fileName
                ? "Change File"
                : "Select File"}
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
