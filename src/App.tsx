import { ChatInput } from "@/components/ChatInput";
import { ChatMessage } from "@/components/ChatMessage";
import { TypingIndicator } from "@/components/TypingIndicator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMessageQueue } from "@/lib/useMessageQueue";
import { ChatState, Message } from "@/types";
import { AnimatePresence, motion } from "framer-motion";
import { Upload } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { CSVPreview } from "./components/CSVPreview/CSVPreview";
import GChatterIntro from "./components/GChatter/GChatterInto";
import { Header } from "./components/Header/Header";
import { getResponse } from "./lib/pandas-api";
import { S3UploadError, uploadToS3 } from "./lib/s3-client";

function App() {
  const [state, setState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    csvData: null,
    error: null,
    s3Key: null,
  });
  console.log("🚀 ~ App ~ state:", state?.s3Key);

  const { queue, processing, addToQueue, processQueue } = useMessageQueue();

  const handleError = (error: string) => {
    setState((prev) => ({ ...prev, error, csvData: null }));
  };

  const processMessage = useCallback(
    async (message: Message) => {
      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, message],
        isLoading: true,
        error: null,
      }));

      try {
        const result = await fetch(
          "https://pandasai-production.up.railway.app/analyze",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify({
              s3_key: state.s3Key,
              query: message?.content,
            }),
          }
        );
        if (!result.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await result.json();
        console.log("🚀 ~ data:", data);

        const response = await getResponse(message.content, data?.response!);
        setState((prev) => ({
          ...prev,
          messages: [...prev.messages, response],
          isLoading: false,
          error: null,
          csvData: data?.response,
        }));
      } catch (error) {
        console.log("🚀 ~ error:", error);
        setState((prev) => ({
          ...prev,
          messages: [
            ...prev.messages,
            {
              id: Date.now().toString(),
              content: "Unable to respond right now.",
              role: "assistant",
              timestamp: new Date(),
              type: "text",
            },
          ],
          isLoading: false,
        }));
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.csvData, state.s3Key]
  );

  const handleSendMessage = async (content: string) => {
    if (!state.s3Key) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: "user",
      timestamp: new Date(),
      type: "text",
    };

    addToQueue(userMessage);
  };

  useEffect(() => {
    if (!processing && queue.length > 0) {
      processQueue(processMessage);
    }
  }, [processing, queue, processQueue, processMessage]);

  function createNewChat() {
    setState({
      messages: [],
      isLoading: false,
      csvData: null,
      error: null,
      s3Key: null,
    });
  }

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(
    null
  );
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const handleFileUpload = useCallback(
    async (
      event: React.ChangeEvent<HTMLInputElement>,
      onFileUploaded: (s3Key: string) => void
    ) => {
      const file = event.target.files?.[0];
      if (!file) return; // Early exit if no file selected

      setFileName(file.name);
      setIsUploading(true);
      setError(null);

      try {
        const s3Key = await uploadToS3(file, (progress) => {
          setUploadProgress(progress);
        });

        onFileUploaded(s3Key); // Trigger the callback with the uploaded key
      } catch (error) {
        if (error instanceof S3UploadError) {
          setError(error.message);
          handleError(error.message);
        } else {
          setError("An unexpected error occurred");
          handleError("An unexpected error occurred");
        }
      } finally {
        setIsUploading(false);
        setUploadProgress(null);
      }
    },
    [handleError]
  );

  return (
    <div className="min-h-screen bg-background">
      <Header createNewChat={createNewChat} />
      <div className="flex h-screen">
        {/* Main Content */}
        <div className="flex flex-col w-screen">
          <main className="flex-1 flex flex-col">
            <AnimatePresence mode="wait">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col"
              >
                <div className="flex flex-col h-screen ">
                  <h1 className="text-2xl font-bold text-center my-4">
                    CSV Conversational AI
                  </h1>
                  {!state.s3Key && <GChatterIntro />}
                  <div className="w-full max-w-[75%] mx-auto h-full">
                    <ScrollArea className="flex-1 px-4 overflow-auto my-4">
                      <div className="mx-auto py-4 space-y-6">
                        {state.messages.map((message) => (
                          <ChatMessage key={message.id} message={message} />
                        ))}
                        {state.isLoading && <TypingIndicator />}
                      </div>
                    </ScrollArea>
                  </div>
                  {state.s3Key && (
                    <div className="m-4">
                      <CSVPreview
                        s3Key={state.s3Key || ""}
                        bucket={import.meta.env.VITE_S3_BUCKET_NAME}
                      />
                    </div>
                  )}

                  <div className="flex items-center sticky bottom-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
                    <div className="relative flex-shrink-0 group ">
                      {/* Upload Icon */}
                      <Upload
                        size={24}
                        color="black"
                        className="cursor-pointer group-hover:bg-gray-300 active:bg-gray-400 w-10 h-10 p-2 rounded-full"
                        onClick={() => {
                          // Create a hidden file input to handle file selection
                          const input = document.createElement("input");
                          input.type = "file";
                          input.accept = ".csv"; // Allow only CSV files
                          input.onchange = (event) =>
                            handleFileUpload(event, (key) => {
                              setState((prevState) => ({
                                ...prevState,
                                s3Key: key,
                                messages: [
                                  ...prevState.messages,
                                  {
                                    id: Date.now().toString(),
                                    content:
                                      'CSV data loaded successfully! Try asking me questions about the data. Type "help" to see what I can do.',
                                    role: "assistant",
                                    timestamp: new Date(),
                                    type: "text",
                                  },
                                ],
                              }));
                            });
                          input.click();
                        }}
                      />

                      {/* Tooltip */}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 hidden group-hover:block bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                        Upload
                      </div>
                    </div>
                    <div className=" flex-1  p-4">
                      <ChatInput
                        onSend={handleSendMessage}
                        disabled={state.isLoading || !state.s3Key}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>

      {state.error && (
        <Alert variant="destructive" className="fixed bottom-4 right-4 w-auto">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}

export default App;
