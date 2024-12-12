import { ChatInput } from "@/components/ChatInput";
import { ChatMessage } from "@/components/ChatMessage";
import { TypingIndicator } from "@/components/TypingIndicator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMessageQueue } from "@/lib/useMessageQueue";
import { ChatState, Message } from "@/types";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { CSVPreview } from "./components/CSVPreview/CSVPreview";
import GChatterIntro from "./components/GChatter/GChatterInto";
import { Header } from "./components/Header/Header";
import { getResponse } from "./lib/pandas-api";

function App() {
  const [isUploading, setIsUploading] = useState(false);
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

  return (
    <div className="min-h-screen bg-gray-100">
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
                  <div className="w-full max-w-[100%] mx-auto h-full">
                    <ScrollArea
                      className="flex-1 px-4 overflow-auto mt-16"
                      style={{ height: "calc(100vh - 260px)" }}
                    >
                      <div
                        className={`mx-auto space-y-6 flex flex-col ${
                          state.s3Key
                            ? "pt-4 items-start justify-start"
                            : "justify-center items-center "
                        } w-full`}
                        style={{ height: "calc(100vh - 260px)" }}
                      >
                        {!state.s3Key && <GChatterIntro />}

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

                  <div className="flex items-center sticky bottom-0  px-4">
                    <div className="flex-1 w-full p-4 pl-48 pr-48">
                      <ChatInput
                        onSend={handleSendMessage}
                        disabled={state.isLoading || !state.s3Key}
                        onError={handleError}
                        isUploading={isUploading}
                        setIsUploading={setIsUploading}
                        onFileUploaded={(key: string) => {
                          setState({
                            ...state,
                            s3Key: key,
                            messages: [
                              {
                                id: Date.now().toString(),
                                content:
                                  'CSV data loaded successfully! Try asking me questions about the data. Type "help" to see what I can do.',
                                role: "assistant",
                                timestamp: new Date(),
                                type: "text",
                              },
                            ],
                          });
                        }}
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
