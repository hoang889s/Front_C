import { io } from "socket.io-client";
let socket = null;
const SOCKET_URL = "http://localhost:8000";
const listeners = {};
export const socketService = {
    connect(token) {
        if (socket){
            console.log("[Socket] Already connected:", socket.id);
            return socket;
        }
        console.log("[Socket] Creating new connection...");
        socket = io(SOCKET_URL, {
            transports: ["websocket"],
            query: { token },
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });
        
        socket.on("connect", () => {
            console.log("[Socket] Connected:", socket.id);
        });
        socket.on("disconnect", (reason) => {
            console.log("[Socket] Disconnected:", reason);
        });
        socket.on("connect_error", (err) => {
             console.error("[Socket] Error:", err.message);
        });
        return socket;
    },
    disconnect() {
        if (socket) {
            Object.keys(listeners).forEach((event)=>{
                listeners[event].forEach((callback)=>{
                    socket.off(event,callback);
                });
            });
            socket.disconnect();
            socket =null;
            console.log("[Socket] Disconnected");
        }

    },
    getSocket(){
        return socket;
    },
    emit(event, data) {
        if (!socket) {
            console.warn("Socket not connected");
            return;
        }
        socket.emit(event, data);
    },
    on(event, callback) {
        if (!socket) {
            console.warn("[Socket] on - Socket not initialized:", event);
            return;
        }
        if(!listeners[event]){
            listeners[event]=[];

        }
        const exists = listeners[event].includes(callback);
        if (!exists){
            listeners[event].push(callback);
            socket.on(event, callback);
            console.log("[Socket] on:", event, `(${listeners[event].length} listeners)`);
        }
    },
    off(event, callback) {
        if (!socket){
            return;
        }
        socket.off(event, callback);
        if(listeners[event]){
            listeners[event] = listeners[event].filter((cb) => cb !== callback);
        }
        console.log("[Socket] off:", event);
    },
    offAll(event){
        if (!socket || !listeners[event]) return;
 
        listeners[event].forEach((callback) => {
            socket.off(event, callback);
        });
        delete listeners[event];
        console.log("[Socket] offAll:", event);
    },
};