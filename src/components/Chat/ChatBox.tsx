import { getResponse } from "@/lib/pandas-api";
import { useMessageQueue } from "@/lib/useMessageQueue";
import { ChatState, Message } from "@/types";
import { useCallback, useEffect, useState } from "react";
import { Alert, AlertDescription } from "../ui/alert";
import { AnimatePresence, motion } from "framer-motion";
import GChatterIntro from "../GChatter/GChatterInto";
import { ScrollArea } from "../ui/scroll-area";
import { ChatMessage } from "../ChatMessage";
import { TypingIndicator } from "../TypingIndicator";
import { ChatInput } from "../ChatInput";
interface ChatBoxProps {
   state:boolean
   setState:(message:boolean)=>void
  }
export default function ChatBox({state,setState}:ChatBoxProps){
    const [isUploading, setIsUploading] = useState(false);
    // const [state, setState] = useState<ChatState>({
    //   messages: [],
    //   isLoading: false,
    //   csvData: null,
    //   error: null,
    //   s3Key: null,
    // });
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
  
    // function createNewChat() {
    //   setState({
    //     messages: [],
    //     isLoading: false,
    //     csvData: null,
    //     error: null,
    //     s3Key: null,
    //   });
    // }
    return(
        <>
          <div className="min-h-screen bg-gray-100"> 
    
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
                  {!state.s3Key && <GChatterIntro />}
                  <div className="w-full max-w-[100%] bg-gray-100 mx-auto h-full">
                    <ScrollArea className="flex-1 px-4 overflow-auto my-4">
                    <div className="mx-auto py-20 space-y-6">
                      
                        {state.messages.map((message) => (
                          <ChatMessage key={message.id} message={message} />
                        ))}
     



                        
                        {state.isLoading && <TypingIndicator />}
                      </div>
                    </ScrollArea>
                  </div>
                  {/* {state.s3Key && (
                    <div className="m-4">
                      <CSVPreview
                        s3Key={state.s3Key || ""}
                        bucket={import.meta.env.VITE_S3_BUCKET_NAME}
                      />
                    </div>
                  )} */}

<div className="flex items-center px-4 bg-gray-100 sticky bottom-0 left-0 right-0 z-10">
  <div className="flex-1 w-full p-4 py-4 sm:pl-16 sm:pr-16 lg:pl-48 lg:pr-48">
    <ChatInput
      onSend={handleSendMessage}
      disabled={state.isLoading || !state.s3Key}
      onError={handleError}
      isUploading={isUploading}
      setIsUploading={setIsUploading}
      s3Key={state.s3Key || ""}
      bucket={import.meta.env.VITE_S3_BUCKET_NAME}
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
        </>
    )
}