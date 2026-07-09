import api from "../api"

export const taskList = async (acc) => {
    try {
        const response = await api.post("/task/list", acc ? { account: acc } : {})
        return response.data
    } catch (error) {
        console.log("Task List", error)
    }
}