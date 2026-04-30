import http from "./http";

// LOGIN
export const loginApi = async (credentials) => {
    try {
        console.log("LOGIN PAYLOAD:", credentials);

        const res = await http.post("/auth/login", credentials);

        console.log("LOGIN RESPONSE:", res.data);

        return {
            token: res.data.token,
            user: res.data.user,
        };
    } catch (error) {
        console.error("LOGIN ERROR:", error.response?.data);

        throw new Error(
            error.response?.data?.error || "Login API failed"
        );
    }
};

// REGISTER
export const registerApi = async (data) => {
    try {
        const res = await http.post("/auth/register", data);
        return res.data;
    } catch (error) {
        throw new Error(
            error.response?.data?.error || "Register API failed"
        );
    }
};

// GET CURRENT USER
export const getMeApi = async () => {
    try {
        const res = await http.get("/auth/me");
        return res.data;
    } catch (error) {
        throw new Error(
            error.response?.data?.error || "Get user failed"
        );
    }
};