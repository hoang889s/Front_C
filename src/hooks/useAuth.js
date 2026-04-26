import { useState, useEffect, useCallback } from "react";
import { loginApi, registerApi } from "../services/api/authApi";
import { getItem, setItem, removeItem } from "../services/storage/localStorage";

const TOKEN_KEY = "token";

export const useAuthLogic = () => {
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    // load token khi app start
    useEffect(() => {
        const savedToken = getItem(TOKEN_KEY);

        console.log("[AUTH] LOAD TOKEN:", savedToken);

        if (savedToken) {
            setToken(savedToken);
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
            setItem(TOKEN_KEY, token);

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
    const logout = useCallback(() => {
        setToken(null);
        removeItem(TOKEN_KEY);
    }, []);

    return {
        token,
        isAuthenticated: !!token,
        loading,
        login,
        register,
        logout
    };
};