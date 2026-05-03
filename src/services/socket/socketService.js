import { io } from "socket.io-client";
import { removeItem } from "../storage/localStorage";
let socket = null;
const SOCKET_URL = "http://localhost:8000";
const listeners = {};
let gameStateCache = null;

export const socketService = {
    connect(token) {
        if (socket){
            console.log("[Socket] Already connected:", socket.id);
            return socket;
        }
        console.log("[Socket] Creating new connection...");
        socket = io(SOCKET_URL, {
            transports: ["websocket"],
            auth: { token },
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });
        
        socket.on("connect", () => {
            console.log("[Socket] Connected:", socket.id);
        });
        socket.on("disconnect", (reason) => {
            console.log("[Socket] Disconnected:", reason);
            //Nếu disconnect vì token hết hạn, xóa token
            if(reason=== "io server disconnect" || reason === "auth error"){
                console.warn("[Socket] Auth error, clearing token");
                removeItem("token");
                removeItem("user");
            }

        });
        socket.on("connect_error", (err) => {
            console.error("[Socket] Error:", err.message);
            // Nếu lỗi auth, xóa token
            if (err.message.includes("401") || err.message.includes("Unauthorized")) {
                console.warn("[Socket] Auth error, clearing token");
                removeItem("token");
                removeItem("user");

            }
        });
        socket.on("logout_success",(data)=>{
            console.log("[Socket] Logout success:", data);
            removeItem("token");
            removeItem("user");
            this.disconnect();
            window.location.href = "/login";
        });
        socket.on("game_state", (data) => {
            console.log("[Socket] Caching game_state:", data);
            gameStateCache = data;
        });

        return socket;
    },
    getGameStateCache() {
        console.log("[Socket] Returning cached game_state:", gameStateCache);
        return gameStateCache;
    },
    clearGameStateCache() {
        console.log("[Socket] Cleared game_state cache");
        gameStateCache = null;
    },
    disconnect() {
        if (socket) {
            console.log("[Socket] Disconnecting...");
            // Xóa tất cả listenner
            Object.keys(listeners).forEach((event)=>{
                listeners[event].forEach((callback)=>{
                    socket.off(event,callback);
                });
            });
            socket.disconnect();
            socket =null;
            gameStateCache = null;
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