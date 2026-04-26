import axios from "axios";
import { getItem } from "../storage/localStorage";

const http = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
    headers: {
        "Content-Type": "application/json",
    },
});

// REQUEST
http.interceptors.request.use((config) => {
    const token = getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log("[HTTP] Attached token:", token); // debug
    }

    return config;
});

// RESPONSE
http.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error("[HTTP ERROR]", error.response?.data || error.message);

        if (error.response?.status === 401) {
            console.warn("Unauthorized - token invalid/expired");
        }

        return Promise.reject(error);
    }
);

export default http;