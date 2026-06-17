import api from "../api"

export const taskList = async (acc) => {
    try {
        const response = await api.post("/taks/list", {
            account: acc,
        })
        return response
    } catch (error) {
        console.log("Task List", error)
    }
}