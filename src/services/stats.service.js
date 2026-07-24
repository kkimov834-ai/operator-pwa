import api from "../api";

export const StatsService = {
    getClientStats: async (data) => {
        return await api.post('/clientStats/get', data)
    },
    updateClientStats: async (data) => {
        return await api.post('/clientStats/update', data)
    }
};
