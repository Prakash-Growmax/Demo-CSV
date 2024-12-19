import { DataChart } from "@/components/DataChart";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Message } from "@/types";
import { motion } from "framer-motion";
import { Bot, Maximize2, User } from "lucide-react";
import { useCallback, useState } from "react";
import Typewriter from "typewriter-effect";
import { useCurrentPng} from "recharts-to-png";
import FileSaver from "file-saver";
interface ChatMessageProps {
  message: Message;
  recent:boolean;
}

export function ChatMessage({ message,recent}: ChatMessageProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const isUser = message.role === "user";
  const [getAreaPng, { ref: areaRef }] = useCurrentPng();


  const handleDownload = useCallback(async () => {
    try {
      const png = await getAreaPng(); // Get PNG from the ref
      if (png) {
        FileSaver.saveAs(png, "data-chart.png"); // Save the file
      } else {
        console.error("Failed to generate PNG. Ensure the chart is rendered correctly.");
      }
    } catch (error) {
      console.error("Error generating PNG:", error);
    }
  }, [getAreaPng]);

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
          {/* <div style={{ width: '600px', height: '350px' }} className="flex flex-col"> */}
        
            <div 
  className="flex flex-col  lg:w-[600px] lg:h-[350px] md:w-[400px] max-w-full" 
>
<div ref={areaRef}>
            <DataChart data={message.data} />
            </div>
 
  {/* <hr className="m-2 border-gray-300 w-full" /> */}
  {/* <button
        onClick={handleDownload}
        className="bg-transparent text-gray-500 py-2 px-4 rounded mt-4"
      >
        Download Chart as PNG
      </button> */}
</div>
          
       
        
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
        className={`flex items-start gap-4${
          isUser ? "w-full" : "justify-start"
        }`}
      >
        
        <div className="flex flex-col items-center w-[100%] p-4 bg-white">
        <div className="flex flex-col mr-auto lg:ml-60 -ml-2">
  <div className="flex">
    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-600 text-primary-foreground  ">
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
        className={`flex items-center gap-4 md:ml-8`}
      >
        <div className="flex flex-col  mr-auto lg:ml-64 -ml-8">
            <div className="flex">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary text-secondary-foreground -mt-2">
          <Bot className="w-6 h-6" />
          </div>
          <div className="font-bold text-sm ml-2">
            <p>Assistant G-Chatter</p>
          </div>
          </div>
      
          <div className="bg-white p-4 h-auto ml-10 rounded-lg mt-2 lg:w-full md:w-full w-80">
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
