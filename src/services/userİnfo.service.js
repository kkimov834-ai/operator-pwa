import api from "../api";

export const getUserInfo = async (acc) => {
    try {
        const response = await api.post("/user/info", { account: acc });
        return response.data;
    } catch (error) {
        console.error("Failed to fetch user info:", error);
        throw error;
    }
};