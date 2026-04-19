import {io} from "socket.io-client";
const URL = "http://localhost:5000";
class SocketService {
    constructor(){
        this.socket = null;
    }
    connect(token = null){
        if(this.socket && this.socket.connected){
            return;
        }
        this.socket = io(URL,{
            autoConnect:false,
            transports: ["websocket"],
            reconnection:true,
            reconnectionAttempts:5,
            reconnectionDelay:1000,
        });
        this.socket.connect();
        this.socket.on("connect",()=>{console.log(" Socket connected:", this.socket.id);});
        this.socket.on("disconnect", (reason) => {console.log("Socket disconnected:", reason);});
        this.socket.on("connect_error", (err) => {
            console.error(" Socket error:", err.message);
        });

    }
    disconnect(){
        if(this.socket){
            this.socket.disconnect();
            this.socket = null;
        }
    }
    emit(event, data){
        if(!this.socket){
            console.warn("Socket chưa connect!");
            return;
        }
        this.socket.emit(event, data);
    }
    on(event, callback){
        if (!this.socket){
            return;
        }
        this.socket.off(event);
        this.socket.on(event, callback);
    }
    off(event,callback){
        if(!this.socket){
            return;
        }
        this.socket.off(event, callback);
    }
    isConnected(){
        return this.socket && this.socket.connected;
    }


}
export const socketService = new SocketService();