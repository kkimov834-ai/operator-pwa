import api from "../api"

export const userModules = async (acc) => {
    try {
        const response = await api.post("/user/modules", {
            account: acc,
        })
        return response.data
    } catch (error) {
        console.log("Error modules user", error)
    }
}