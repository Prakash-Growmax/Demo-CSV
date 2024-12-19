
export function useGetChatHistory(chatId) {
    const getChatHistory = {
      status: 200,
      data: {
        chat_id: "chat_001",
        messages: [
          {
            id: "msg_001",
            role: "user",
            content: "Upload sales_2023.csv",
            timestamp: "2024-12-16T10:28:00Z",
            type:"text"
          },
          {
            id: "msg_002",
            role: "assistant",
            content: "File uploaded successfully. I can help you analyze the sales data.",
            timestamp: "2024-12-16T10:28:05Z",
            type:"text"
          },
          {
            id: "msg_003",
            role: "user",
            content: "What was the total revenue for Q4?",
            timestamp: "2024-12-16T10:30:00Z",
            type:"text"
          },
        ],
      },
    };
  
    if (chatId) {
      return { data: getChatHistory?.data?.messages };
    }
  
    return { data: null }; 
  }
  