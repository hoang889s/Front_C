import { useEffect, useRef } from "react";
import { socketService } from "../services/socket/socketService";
export const useSocket = (token) => {
    const socketRef = useRef(null);
    useEffect(() => {
        if (!token){
            return;
        }
        const socket = socketService.connect(token);
        socketRef.current = socket;
        return  () =>{

        }

    },[token]);
    const emit = (event, data) => {
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