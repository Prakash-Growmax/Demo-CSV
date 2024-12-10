import { ChatInput } from "@/components/ChatInput";
import { ChatMessage } from "@/components/ChatMessage";
import { FileUpload } from "@/components/FileUpload";
import { TypingIndicator } from "@/components/TypingIndicator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMessageQueue } from "@/lib/useMessageQueue";
import { ChatState, Message } from "@/types";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { Header } from "./components/Header/Header";
import { getResponse } from "./lib/pandas-api";

function App() {
  const [state, setState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    csvData: null,
    error: null,
    s3Key: null,
  });
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
              s3_key: "analytics/obo-order-prds.csv",
              query: message?.content,
            }),
          }
        );
        if (!result.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await result.json();

        const response = await getResponse(
          message.content,
          data.analysis.response!
        );
        setState((prev) => ({
          ...prev,
          messages: [...prev.messages, response],
          isLoading: false,
          error: null,
          csvData: data.analysis.response,
        }));
      } catch (error) {
        const response = await getResponse(
          message.content,
          sample_json.analysis.response!
        );
        console.log("🚀 ~ response:", response);
        console.log("🚀 ~ error:", error);
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: "Failed to get response",
        }));
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.csvData]
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex h-screen">
        {/* Main Content */}
        <div className="flex flex-col w-screen">
          <main className="flex-1 flex flex-col">
            <AnimatePresence mode="wait">
              {!state.s3Key ? (
                <div className="flex-1 flex items-center justify-center p-4">
                  <FileUpload
                    // onDataLoaded={handleDataLoaded}
                    onError={handleError}
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
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col"
                >
                  <div>
                    <h1 className="text-2xl font-bold text-center my-4">
                      CSV Conversational AI
                    </h1>

                    <ScrollArea className="flex-1 px-4">
                      <div className=" mx-auto py-4 space-y-6">
                        {state.messages.map((message) => (
                          <ChatMessage key={message.id} message={message} />
                        ))}
                        {state.isLoading && <TypingIndicator />}
                      </div>
                    </ScrollArea>

                    <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                      <div className="max-w-3xl mx-auto p-4">
                        <ChatInput
                          onSend={handleSendMessage}
                          disabled={state.isLoading || !state.s3Key}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
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

const sample_json = {
  analysis: {
    response: {
      charts: {
        bar: {
          data: [
            {
              x: "0",
              y: 3456.0,
            },
            {
              x: "1",
              y: 3456.0,
            },
          ],
          title: "asked_quantity Analysis",
          type: "bar",
          xAxis: {
            data: ["0", "1"],
            title: "Categories",
            type: "category",
          },
          yAxis: {
            title: "asked_quantity",
            type: "value",
          },
        },
        default: "bar",
        line: {
          data: [
            {
              x: "0",
              y: 3456.0,
            },
            {
              x: "1",
              y: 3456.0,
            },
          ],
          title: "asked_quantity Trend",
          type: "line",
          xAxis: {
            data: ["0", "1"],
            title: "Time",
            type: "category",
          },
          yAxis: {
            title: "asked_quantity",
            type: "value",
          },
        },
        pie: {
          data: [
            {
              name: "0",
              value: 3456.0,
            },
            {
              name: "1",
              value: 3456.0,
            },
          ],
          title: "asked_quantity Distribution",
          type: "pie",
        },
      },
      table: {
        data: [
          ["புரு காபி Bru Instant coffee ₹2 (Pack of 12x2)", 3456.0, 1662],
          ["புரு காபி Bru Instant coffee ₹2 (Pack of 12x2)", 3456.0, 1662],
        ],
        headers: ["Product_Short_Description", "asked_quantity", "products_id"],
        type: "table",
      },
      text: {
        content:
          "                        Product_Short_Description  asked_quantity  products_id\n0  புரு காபி Bru Instant coffee ₹2 (Pack of 12x2)          3456.0         1662\n1  புரு காபி Bru Instant coffee ₹2 (Pack of 12x2)          3456.0         1662",
        type: "text",
      },
    },
    status: "success",
  },
  query: "which has the most asked_quantity product?",
  status: "success",
};
