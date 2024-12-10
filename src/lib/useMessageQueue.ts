import { useState, useCallback } from 'react';
import { Message } from '@/types';

export function useMessageQueue() {
  const [queue, setQueue] = useState<Message[]>([]);
  const [processing, setProcessing] = useState(false);

  const addToQueue = useCallback((message: Message) => {
    setQueue(prev => [...prev, message]);
  }, []);

  const processQueue = useCallback(async (handler: (message: Message) => Promise<void>) => {
    if (processing || queue.length === 0) return;

    setProcessing(true);
    const message = queue[0];

    try {
      await handler(message);
      setQueue(prev => prev.slice(1));
    } catch (error) {
      console.error('Error processing message:', error);
    } finally {
      setProcessing(false);
    }
  }, [processing, queue]);

  return {
    queue,
    processing,
    addToQueue,
    processQueue
  };
}