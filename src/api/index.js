import axios from "axios";

const api = axios.create({
    baseURL: "https://api.akul.az/devgate/", // Backend URL
    headers: {
        "Content-Type": "application/json",
    },
});

// Hər sorğuya avtomatik Token əlavə edən interceptor
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Backend-dən gələn standart response strukturunu handle etmək üçün
api.interceptors.response.use(
    (response) => response.data, // Backend-dən { status: "success", data: {...} } gəlir
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("token");
            window.location.reload();
        }
        return Promise.reject(error);
    }
);

export default api;