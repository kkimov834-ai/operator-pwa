import api from "../api"

export const userHistory = async (acc) => {
    try {
        const response = await api.post("/user/history", {
            account: acc
        })
        return response
    } catch (error) {
        console.log("Failed User History", error)
    }
}