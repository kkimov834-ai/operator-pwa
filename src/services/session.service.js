import api from "../api";

export const killSession = async (account, login) => {
    try {
        const payload = { account };
        if (login) payload.login = login;
        const response = await api.post("/session/kill", payload);
        return response.data;
    } catch (error) {
        console.error("killSession Xeta:", error);
        throw error;
    }
};
