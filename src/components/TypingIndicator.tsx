import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Bot } from 'lucide-react';

export function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="flex gap-3 ml-64"
    >
      <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
        <Bot className="w-5 h-5 text-secondary-foreground" />
      </div>
      <Card className="p-4 w-24">
        <div className="flex items-center space-x-2">
          <motion.div
            className="w-2 h-2 bg-primary rounded-full"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          />
          <motion.div
            className="w-2 h-2 bg-primary rounded-full"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.5, repeat: Infinity, delay: 0.2 }}
          />
          <motion.div
            className="w-2 h-2 bg-primary rounded-full"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.5, repeat: Infinity, delay: 0.4 }}
          />
        </div>
      </Card>
    </motion.div>
  );
}