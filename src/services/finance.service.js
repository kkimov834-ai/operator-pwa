import api from "../api";

export const addCredit = async (payload) => {
    try {
        const response = await api.post("/finance/addCredit", payload);
        return response.data;
    } catch (error) {
        console.error("Failed to add credit", error);
        throw error;
    }
};

export const addBonus = async (payload) => {
    try {
        const response = await api.post("/finance/addBonus", payload);
        return response.data;
    } catch (error) {
        console.error("Failed to add bonus", error);
        throw error;
    }
};
