import { useState, useEffect, useCallback } from "react";
import { loginApi, registerApi,logoutApi } from "../services/api/authApi";
import { getItem, setItem, removeItem,clearStorage } from "../services/storage/localStorage";

const TOKEN_KEY = "token";
const USER_KEY = "user";

export const useAuthLogic = () => {
    const [token, setToken] = useState(null);
    const [user,setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // load token khi app start
    useEffect(() => {
        const savedToken = getItem(TOKEN_KEY);
        const savedUser = getItem(USER_KEY);

        console.log("[AUTH] LOAD TOKEN:", savedToken);
        console.log("[AUTH] LOAD USER:", savedUser);

        if (savedToken) {
            setToken(savedToken);
            setUser(savedUser);
        }

        setLoading(false);
    }, []);

    // LOGIN
    const login = useCallback(async (credentials) => {
        try {
            setLoading(true);

            const res = await loginApi(credentials);
            const token = res.access_token || res.token;

            if (!token) throw new Error("No token received");

            setToken(token);
            setUser(res.user);
            setItem(TOKEN_KEY, token);
            setItem(USER_KEY, res.user);

            return { success: true };
        } catch (err) {
            return {
                success: false,
                message: err.message || "Login failed"
            };
        } finally {
            setLoading(false);
        }
    }, []);

    // REGISTER
    const register = useCallback(async (data) => {
        try{
            await registerApi(data);
            return { success: true };
        }
        catch (err) {
            return { success: false, message: err.message };
        }
    }, []);

    // LOGOUT
    const logout = useCallback(async() => {
        try{
            setLoading(true);
            await logoutApi();
            console.log("[AUTH] Logout API called successfully");
        }
        catch(err){
            console.error("[AUTH] Logout API error:", err);
        }
        finally{
            setToken(null);
            setUser(null);
            removeItem(TOKEN_KEY);
            removeItem(USER_KEY);
            clearStorage();
            if (window.socket) {
                window.socket.disconnect();
                console.log("[AUTH] Socket disconnected");
            }
            setLoading(false);
            console.log("[AUTH] Logout completed");
        }
    }, []);

    return {
        token,
        user,
        isAuthenticated: !!token,
        loading,
        login,
        register,
        logout
    };
};