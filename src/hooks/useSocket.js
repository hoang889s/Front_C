import { useEffect, useRef } from "react";
import { socketService } from "../services/socket/socketService";
import { removeItem } from "../services/storage/localStorage";
export const useSocket = (token) => {
    const socketRef = useRef(null);
    useEffect(() => {
        if (!token){
            socketService.disconnect();
            return;
        }
        const socket = socketService.connect(token);
        socketRef.current = socket;
        return  () =>{
            console.log("[useSocket] Cleanup - disconnecting socket");
            socketService.disconnect();
        }

    },[token]);
    const emit = (event, data) => {
        if(!socketRef.current){
            console.warn("[useSocket] Socket not connected, cannot emit:", event);
            return;
        }
        socketService.emit(event, data);
    };
    const on = (event, callback) => {
        socketService.on(event, callback);
    };
    const off = (event, callback) => {
        socketService.off(event, callback);
    };
    return {
        socket: socketRef.current,
        emit,
        on,
        off,
    };
};