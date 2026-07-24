import api from "../api"

export const taskList = async (acc) => {
    try {
        const response = await api.post("/task/list", acc ? { account: acc } : {})
        return response.data
    } catch (error) {
        console.log("Task List", error)
    }
}

export const createTask = async (payload) => {
    try {
        const response = await api.post("/task/create", payload);
        return response.data;
    } catch (error) {
        console.log("Create Task", error);
        throw error;
    }
}

export const updateTask = async (payload) => {
    try {
        const response = await api.post("/task/update", payload);
        return response.data;
    } catch (error) {
        console.log("Update Task", error);
        throw error;
    }
}

export const updateTaskPriority = async (payload) => {
    try {
        const response = await api.post("/task/updatePriority", payload);
        return response.data;
    } catch (error) {
        console.log("Update Task Priority", error);
        throw error;
    }
}

export const updateTaskStatus = async (payload) => {
    try {
        const response = await api.post("/task/updateStatus", payload);
        return response.data;
    } catch (error) {
        console.log("Update Task Status", error);
        throw error;
    }
}