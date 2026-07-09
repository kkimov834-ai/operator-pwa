import api from "../api";

export const getUserAccounts = async (acc) => {
    try {
        const response = await api.post("/user/accounts", {
            search: acc
        });
        return response.data;
    } catch (error) {
        console.error("Failed to fetch user accounts", error)
        throw error;
    }
}
