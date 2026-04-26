import http from "./http";
// LOGIN
const API_URL = "http://localhost:5000/api";
export const loginApi = async (credentials) => {
    try{
        const res = await http.post("/auth/login", credentials);
        console.log("LOGIN RESPONSE:", res.data);
        return{
            token: res.data.token,
            user: res.data.user,
        }

    }
    catch (error){
        throw new Error(error.response?.data?.message || "Login API failed");
    }
};
// REGISTER
export const registerApi = async (data) => {
    try{
        const res = await http.post("/auth/register", data);
        return res.data;
    }
    catch(error){
        throw new Error(
            error.response?.data?.message || "Register API failed"
        );
    }
};
// GET CURRENT USER
export const getMeApi = async () => {
    try{
        const res = await http.get("/auth/me");
        return res.data;
    }
    catch (error){
        throw new Error(error.response?.data?.message || "Get user failed");
    }
}