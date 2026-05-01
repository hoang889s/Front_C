import { useEffect, useState } from "react";
import { socketService } from "../../services/socket/socketService";
import { useAuth } from "../../context/AuthContext";

const RoomJoin = () => {
    const { token } = useAuth();

    const [roomCode, setRoomCode] = useState("");
    const [status, setStatus] = useState("");

    useEffect(() => {
        if (!token) return;

        socketService.connect(token);

        const handleRoomJoined = (data) => {
            console.log("Joined Room:", data);
            setStatus("Đã vào phòng thành công");
        };
        const handleGameJoined = (data) => {
            console.log("Joined Game:", data);
            setStatus("Đã vào game");
            console.log("Joined Game:", data);
        };

        const handleError = (err) => {
            console.error("Socket error:", err);
            setStatus(err.message || "Join thất bại");
        };

        socketService.on("room_joined", handleRoomJoined);
        socketService.on("game_state", handleGameJoined);
        socketService.on("error", handleError);

        return () => {
            socketService.off("room_joined", handleRoomJoined);
            socketService.off("game_state", handleGameJoined);
            socketService.off("error", handleError);
        };
    }, [token]);

    const handleJoinRoom = () => {
        if (!roomCode.trim()) {
            setStatus("Vui lòng nhập room code");
            return;
        }

        setStatus("Đang tham gia phòng...");

        socketService.emit("join_room", {
            room_code: roomCode,
        });
    };
    const handleJoinGame = () =>{
        if (!roomCode.trim()) {
            setStatus("Thiếu room code để vào game");
            return;
        }
        setStatus("Đang vào game...");
        socketService.emit("join_game", {
            gameId: 23,
        });
        console.log("Emitted join_game with room_code:", roomCode);
    }

    return (
        <div style={{ padding: 20 }}>
            <h2>Tham gia phòng</h2>

            <input
                type="text"
                placeholder="Nhập room code..."
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                style={{ padding: 8, marginRight: 10 }}
            />

            <button onClick={handleJoinRoom}>
                Join Room
            </button>
            <button onClick={handleJoinGame} style={{ marginLeft: 10 }}>
                Join Game
            </button>

            <div style={{ marginTop: 10 }}>{status}</div>
        </div>
    );
};

export default RoomJoin;