export function useCreateChatId() {
    const createNewChat = {
        status: 200,
        data: {
            chat_id: "chat_003",
            title: "Untitled Analysis",
            created_at: "2024-12-16T11:00:00Z"
        }
    };
    return { data: createNewChat?.data }; // Explicitly assign `data` key
}
