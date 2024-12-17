import { getResponse } from "@/lib/pandas-api";
import { useMessageQueue } from "@/lib/useMessageQueue";
import { ChatState, Message } from "@/types";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, AlertDescription } from "../ui/alert";
import { AnimatePresence, motion } from "framer-motion";
import GChatterIntro from "../GChatter/GChatterInto";
import { ScrollArea } from "../ui/scroll-area";
import { ChatMessage } from "../ChatMessage";
import { TypingIndicator } from "../TypingIndicator";
import { ChatInput } from "../ChatInput";
import LinearIndeterminate from "../ui/LinerProgress";
import { Bot } from "lucide-react";
import { useCreateChatId } from "@/hooks/useCreateChatId";

interface ChatBoxProps {
  state: ChatState;
  setState: (state: ChatState) => void;
  isUploading: boolean;
  setIsUploading: (state: boolean) => void;
}

export default function ChatBox({
  state,
  setState,
  isUploading,
  setIsUploading
}: ChatBoxProps) {
  const { queue, processing, addToQueue, processQueue } = useMessageQueue();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
 
  // Scroll to bottom function
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);
  // const scrollToBottom = useCallback(() => {
  //   if (messagesEndRef.current) {
  //     // Calculate a partial scroll instead of full scroll
  //     const scrollArea = scrollAreaRef.current;
  //     if (scrollArea) {
  //       // Scroll to near the bottom, leaving some context visible
  //       const partialScroll = scrollArea.scrollHeight - scrollArea.clientHeight -110; // Adjust 100 as needed
  //       scrollArea.scrollTo({
  //         top: partialScroll,
  //         behavior: 'smooth'
  //       });
  //     }
  //   }
  // }, []);

  // Effect to scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [state.messages, scrollToBottom,state.s3Key]);

  const handleError = (error: string) => {
    setState((prev) => ({ ...prev, error, csvData: null }));
  };

  return (
    <>
      <div className="min-h-screen">
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
                  <div className="flex flex-col h-screen">
                  
                    {/* {!state.s3Key && <GChatterIntro />} */}
                 
                
                    

                    <div className="w-full md:w-full max-w-[100%] mx-auto h-full items-center justify-center">
                      <ScrollArea ref={scrollAreaRef} className="flex-1 px-4 overflow-auto my-4 items-center">
                        <div className="mx-auto py-20 space-y-6">
                          {state.messages.map((message) => (
                            <ChatMessage 
                              key={message.id} 
                              message={message} 
                              state={state}
                            />
                          ))}

                          {state.isLoading && (
                            <>
                              <div className="flex lg:ml-72">
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary text-secondary-foreground -mt-2">
                                  <Bot className="w-6 h-6" />
                                </div>
                                <div className="font-bold text-sm ml-2">
                                  <p>Assistant G-Chatter</p>
                                </div>
                              </div>
                              <div className="flex items-center justify-center">
                                <div className="flex flex-col w-1/2">
                                  <div className="mb-4">
                                    <LinearIndeterminate />
                                  </div>
                                  <LinearIndeterminate />
                                </div>
                              </div>
                            </>
                          )}

                          {/* Invisible div to help with scrolling */}
                          <div ref={messagesEndRef} />
                        </div>
                      </ScrollArea>
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
  );
}