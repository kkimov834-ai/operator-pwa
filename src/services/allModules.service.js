import api from "../api"

export const allModules = async () => {
    try {
        const response = await api.post("/module/all")
        return response
    } catch (error) {
        console.log("All Modules getirilerken xeta", error)
    }
}
