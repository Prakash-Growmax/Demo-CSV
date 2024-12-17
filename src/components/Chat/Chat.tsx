import { getResponse } from "@/lib/pandas-api";
import { useMessageQueue } from "@/lib/useMessageQueue";
import { ChatState, Message } from "@/types";
import { useCallback, useEffect, useState } from "react";
import { Header } from "../Header/Header";
import GChatterIntro from "../GChatter/GChatterInto";
import ChatBox from "./ChatBox";
import { ChatInput } from "../ChatInput";
import { useParams } from "react-router-dom";
import { useGetChatHistory } from "@/hooks/useGetChatHistory";
interface ChatProps{
  message:(chat:string)=>void
}
function Chat({message}:ChatProps){
    const [open, setOpen] = useState(false);
    const { queue, processing, addToQueue, processQueue } = useMessageQueue();
    const [isUploading, setIsUploading] = useState(false);
   
   
    const [state, setState] = useState<ChatState>({
      messages: [],
      isLoading: false,
      csvData: null,
      error: null,
      s3Key: null,
    });
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
    useEffect(() => {
      if (message?.length) {
        const mappedMessages = message.map((msg) => ({
          id: msg.id, // Example of mapping fields
          content: msg.content, // Assuming the structure of each message
          timestamp: msg.timestamp || Date.now(), 
          role:msg.role,
          type:msg.type
        }));
       const s3ky="Recents"
        setState((prev) => ({
          ...prev,
          messages: mappedMessages,// Store the transformed messages
          s3Key:s3ky,
          isLoading: false, // Mark as done
          error: null, // Reset error state
        }));
      }
    }, [message]);
    
    // console.log(state)
    const handleSendMessage = async (content: string) => {
      if (!state.s3Key) return;
  
      const userMessage: Message = {
        id: Date.now().toString(),
        content,
        role: "user",
        timestamp: new Date(),
        type: "text",
      };
  
      addToQueue (userMessage);
    };
    function createNewChat() {
      setState({
        messages: [],
        isLoading: false,
        csvData: null,
        error: null,
        s3Key: null,
      });
    }
    const handleError = (error: string) => {
      setState((prev) => ({ ...prev, error, csvData: null }));
    };
  
    useEffect(() => {
      if (!processing && queue.length > 0) {
        processQueue(processMessage);
      }
    }, [processing, queue, processQueue, processMessage]);
  
    return (
      <div className="relative h-screen flex flex-col overflow-x-hidden">
      <Header createNewChat={createNewChat} open={open} setOpen={setOpen} />
      {(!state.s3Key && !message) && <GChatterIntro />}
      <div
        className={`transition-transform duration-300 items-center  ease-in-out ${
          open
            ? "lg:translate-x-[100px] lg:w-[1430px] md:translate-x-[100px]"
            : ""
        }`}
        style={{
          height:"auto",
          overflow:"auto",
          backgroundColor: "#F6F8FA",
        }}
      >
        <ChatBox
          state={state}
          setState={setState}
          isUploading={isUploading}
          setIsUploading={setIsUploading}
        />
      </div>
    
      <div>
        <div
          className={`flex items-center px-4 bg-[#F6F8FA] sticky bottom-0 left-0 right-0 z-10 py-4 ${
            open
              ? "lg:translate-x-[150px] lg:w-[1330px] md:translate-x-[200px] md:w-[500px]"
              : ""
          }`}
        >
          <div className="flex-1 w-full sm:pl-16 sm:pr-16 lg:pl-48 lg:pr-48 lg:py-2">
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
    </div>
    
  
    
    );
}
export default Chat;