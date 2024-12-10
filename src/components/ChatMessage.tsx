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

  const renderContent = () => {
    if (message.type === "text") {
      return true ? (
        <p className="text-sm">{message.content}</p>
      ) : (
        <div className="text-sm">
          <Typewriter
            options={{
              strings: [message.content],
              autoStart: true,
              delay: 30,
              cursor: "",
            }}
          />
        </div>
      );
    }

    if (message.type === "chart") {
      return (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.5 }}
          className="mt-4 relative"
        >
          <Button
            variant="outline"
            size="icon"
            className="absolute top-2 right-2 z-10"
            onClick={() => setIsFullscreen(true)}
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
          <DataChart data={message.data} />
        </motion.div>
      );
    }

    if (message.type === "table") {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
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
      {/* <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`flex gap-4 ${isUser ? "justify-end" : "justify-start"}`}
      > */}
      <div
        className={`flex gap-3 max-w-[80%] ${
          isUser ? "flex-row-reverse" : "flex-row"
        }`}
      >
        <div className="flex-shrink-0">
          {isUser ? (
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-primary-foreground" />
            </div>
          ) : (
            <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-secondary-foreground" />
            </div>
          )}
        </div>
        <Card className="w-full p-4 space-y-2">{renderContent()}</Card>
      </div>
      {/* </motion.div> */}

      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-[90vw] w-[90vw] h-[90vh]">
          {message.type === "chart" && <DataChart data={message.data} />}
        </DialogContent>
      </Dialog>
    </>
  );
}
