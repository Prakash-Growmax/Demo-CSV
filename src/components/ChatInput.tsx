import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AnimatePresence, motion } from "framer-motion";
import { Send } from "lucide-react";
import { useRef, useState } from "react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState("");
  const [rows, setRows] = useState(1);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("🚀 ~ ChatInput ~ input:", input);

    if (input.trim() && !isSubmitting) {
      setIsSubmitting(true);
      onSend(input.trim());
      setInput("");
      setRows(1);
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // useEffect(() => {
  //   if (textareaRef.current) {
  //     const lineHeight = 24;
  //     const maxRows = 5;
  //     const newRows = Math.min(
  //       Math.max(Math.ceil(textareaRef.current.scrollHeight / lineHeight), 1),
  //       maxRows
  //     );
  //     setRows(newRows);
  //   }
  // }, [input]);

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="flex gap-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 rounded-lg border shadow-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask a question about your data..."
        className="flex-1 min-h-[60px] max-h-[144px] resize-none"
        disabled={disabled || isSubmitting}
        rows={rows}
      />
      <AnimatePresence>
        {input.trim() && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <Button
              type="submit"
              disabled={disabled || isSubmitting || !input.trim()}
              className="h-full"
            >
              <Send className="h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.form>
  );
}
