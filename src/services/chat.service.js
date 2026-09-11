import api from "../api";

export const ChatService = {
    getActiveChats: async () => {
        const response = await api.post('/chat/getActiveChats', {});
        return response.data;
    },
    getMessages: async (chatId, limit = 100) => {
        const response = await api.post('/chat/getMessages', { chat_id: chatId, limit });
        return response.data;
    },
    closeChat: async (chatId) => {
        const response = await api.post('/chat/closeChat', { chat_id: chatId });
        return response.data;
    },
    deleteChat: async (chatId, clientId) => {
        const response = await api.post('/chat/deleteChat', { chat_id: chatId, client_id: clientId });
        return response.data;
    }
};
