import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AnimatePresence, motion } from "framer-motion";
import { Send, Upload } from "lucide-react";
import { useCallback, useRef, useState } from "react";

import { S3UploadError, UploadProgress, uploadToS3 } from "@/lib/s3-client";


interface ChatInputProps {
  onSend: (message: string) => void;
  disabled: boolean;
  onFileUploaded: (s3Key: string) => void;
  onError: (error: string) => void;
  isUploading:boolean;
  setIsUploading:(state:boolean)=>void
  
}

export function ChatInput({ onSend, disabled, onFileUploaded, onError,isUploading,setIsUploading }: ChatInputProps) {
  const [input, setInput] = useState("");
  const [rows, setRows] = useState(1);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
 
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
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
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("🚀 ~ ChatInput ~ input:", input);

    if (input.trim() && !isSubmitting) {
      setIsSubmitting(true);
      onSend(input.trim());
      setInput("");
      setRows(1);
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 p-4 bg-white shadow-md hover:shadow-lg rounded-lg border border-gray-300 min-h-40"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="relative flex items-center justify-content flex-1 mb-6">
        <div className="relative flex-1">
          <div className="absolute top-1/2 left-4 z-10 transform -translate-y-1/2">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
              id="csv-upload"
              disabled={isUploading}
            />
            <Upload
              size={24}
              color="black"
              className="cursor-pointer hover:bg-gray-200 active:bg-gray-300 w-8 h-8 p-1 rounded-full"
              onClick={() => document.getElementById("csv-upload")?.click()}
            />
          </div>

          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about your data..."
            className="flex-1 min-h-[60px] max-h-[144px] rounded-3xl border border-blue-500 pr-12 pl-12 pl-[50px] hover:border-blue-500 focus:border-blue-500 resize-none placeholder:pl-[20px] placeholder:mt-[100px] placeholder:font-semibold pt-2 pb-2 leading-[1.5] focus:placeholder:mt-16 text-base placeholder:top-16"
            rows={rows}
          />
        </div>
        <Button
          type="submit"
          className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 ml-2"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </motion.form>
  );
}