import { createContext, useContext } from "react";
import { useAuthLogic } from "../hooks/useAuth";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const auth = useAuthLogic();

    return (
        <AuthContext.Provider value={auth}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};