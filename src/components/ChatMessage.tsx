import { DataChart } from "@/components/DataChart";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Message } from "@/types";
import { motion } from "framer-motion";
import { Bot, Maximize2, User } from "lucide-react";
import { useState } from "react";
import Typewriter from "typewriter-effect";

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const isUser = message.role === "user";
  console.log(message)
  const renderContent = () => {
    if (message.type === "text") {
      return (
        <div className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
          {message.isTyping ? (
            <Typewriter
              options={{
                strings: [message.content],
                autoStart: true,
                delay: 30,
                cursor: "",
              }}
            />
          ) : (
            <p className="text-sm">{message.content}</p>
          )}
        </div>
      );
    }

    if (message.type === "chart") {
      // console.log(message);

      return (
        <motion.div
          initial={{ opacity: 0, transform: "scale(0.95)" }}
          animate={{ opacity: 1, transform: "scale(1)" }}
          transition={{ duration: 0.5 }}
          className="relative mt-4"
        >
          <Button
            variant="outline"
            size="icon"
            className="absolute top-2 right-2 z-10"
            onClick={() => setIsFullscreen(true)}
          >
            <Maximize2 className="h-4 w-4 text-gray-500 hover:text-gray-800" />
          </Button>
          <DataChart data={message.data} />
        </motion.div>
      );
    }

    if (message.type === "table") {
      return (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-4 overflow-x-auto"
        >
          <DataTable data={message.data} />
        </motion.div>
      );
    }
  };

  return (
    <>
    {isUser ? (  <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`flex items-start gap-4 ${
          isUser ? "w-full" : "justify-start"
        }`}
      >
        
        <div className="flex flex-col items-center w-[100%] p-4 bg-white">
        <div className="flex flex-col mr-auto ml-60">
  <div className="flex">
    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-600 text-primary-foreground ">
      <User className="w-5 h-5" />
    </div>
    <p className="font-bold text-sm ml-2">ajitha@apptino.com</p>
  </div>
  <div className="w-full ml-10">
    {renderContent()}
  </div>
</div>

      
        </div>
        {/* <div
          className={`flex items-center justify-center w-10 h-10 rounded-full ${
            isUser
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground"
          }`}
        >
          {isUser ? <User className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
        </div>
        <Card
          className={`w-[100%] p-4 shadow-lg rounded-lg border ${
            isUser
              ? "bg-white text-primary-foreground "
              : "bg-secondary/10 text-secondary-foreground border-secondary"
          }`}
        >
          {renderContent()}
        </Card> */}
      </motion.div>) : (<motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`flex items-start gap-4 ${
          isUser ? "w-full" : "justify-start"
        }`}
      >
        <div className="flex flex-col mr-auto ml-64 ">
          <div className="flex">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary text-secondary-foreground -mt-2">
          <Bot className="w-6 h-6" />
          </div>
          <div className="font-bold text-sm ml-2">
            <p>Assistant G-Chatter</p>
          </div>
          </div>
          <div className="bg-white p-4 h-auto ml-10 rounded-sm">
          {renderContent()}
        </div>
          
        </div>
       
      </motion.div>)}
  
    

      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-[90vw] w-[90vw] h-[90vh] overflow-auto">
          {message.type === "chart" && <DataChart data={message.data} />}
        </DialogContent>
      </Dialog>
    </>
  );
}
