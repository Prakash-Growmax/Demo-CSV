export function useChatList(){
    const getChatsList = {
        status: 200,
        data: {
          chats: [
            {
              chat_id: "chat_001",
              title: "Sales Analysis 2023",
              last_message: "What was the total revenue for Q4?",
              timestamp: "2024-12-16T10:30:00Z",
              file_name: "sales_2023.csv"
            },
            {
              chat_id: "chat_002",
              title: "Customer Demographics",
              last_message: "Show me age distribution",
              timestamp: "2024-12-15T15:45:00Z",
              file_name: "customers.csv"
            }
          ]
        }
      };
      return {data:getChatsList?.data?.chats}
}