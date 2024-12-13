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
import { Progress } from "./components/ui/progress";
import ChatBox from "./components/Chat/ChatBox";

function App() {
  const [open, setOpen] = useState(false);
  // const [isUploading, setIsUploading] = useState(false);
  const [state, setState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    csvData: null,
    error: null,
    s3Key: null,
  });


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
    <div className="relative">
    <Header createNewChat={createNewChat} open={open} setOpen={setOpen} />
    <div
        className={`transition-transform duration-300 ease-in-out ${
          open ? "translate-x-[100px]" : "translate-x-0"
        }`}
      >
      <ChatBox state={state} setState={setState} />
    </div>
  </div>

  
  );
}

export default App;
