import { useEffect, useState } from "react";
import { socketService } from "../../services/socket/socketService";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const RoomJoin = () => {
    const { token } = useAuth();
    const navigate = useNavigate();

    const [roomCode, setRoomCode] = useState("");
    const [status, setStatus] = useState("");
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [gameId, setGameId] = useState(null);

    useEffect(() => {
        if (!token) return;

        const socket = socketService.connect(token);
        if (socket.connected) {
            console.log("[RoomJoin] Socket already connected");
            setIsConnected(true);
        }

        const handleConnect = () => {
            console.log("[RoomJoin] Socket connected");
            setIsConnected(true);
            setStatus("✓ Đã kết nối");
        };

        const handleDisconnect = () => {
            console.log("[RoomJoin] Socket disconnected");
            setIsConnected(false);
            setStatus("⏳ Mất kết nối");
        };

        const handleRoomCreated = (data) => {
            console.log("[RoomJoin] Room created:", data);
            setRoomCode(data.room_code);
            setStatus(`📋 Phòng tạo: ${data.room_code} - Chờ người chơi khác...`);
            setIsLoading(false);
        };

        const handleRoomJoined = (data) => {
            console.log("[RoomJoin] Room joined:", data);
            console.log("[RoomJoin] Room join response:", data.game_id);
            if (data.game_id) {
                setGameId(data.game_id);
                setStatus(`✅ Vào phòng thành công! Chuyển tới bàn cờ...`);
                setTimeout(() => {
                    navigate(`/game/${data.game_id}`);
                }, 1500);
            } else {
                setStatus(`⏳ Vào phòng thành công! Chờ người chơi thứ 2...`);
            }
            setIsLoading(false);
        };

        const handleGameCreated = (data) => {
            console.log("[RoomJoin] Game created:", data);
            setGameId(data.game_id);
            setStatus(`✅ Game tạo thành công! ID: ${data.game_id}`);
        };

        const handleGameState = (data) => {
            console.log("[RoomJoin] Game state:", data);
            if (data.black) {
                setStatus(`✅ Bàn cờ sẵn sàng! Chuyển tới game...`);
                setGameId(data.game_id);
                setTimeout(() => {
                    navigate(`/game/${data.game_id}`);
                }, 1000);
            } else {
                setStatus(`⏳ Chờ người chơi thứ 2 join...`);
            }
            setIsLoading(false);
        };

        const handleError = (err) => {
            console.error("[RoomJoin] Error:", err);
            setStatus(`❌ Lỗi: ${err.message || "Có lỗi xảy ra"}`);
            setIsLoading(false);
        };

        socket.on("connect", handleConnect);
        socket.on("disconnect", handleDisconnect);
        socketService.on("room_created", handleRoomCreated);
        socketService.on("room_joined", handleRoomJoined);
        socketService.on("game_created", handleGameCreated);
        socketService.on("game_state", handleGameState);
        socketService.on("error", handleError);
        socket.on("game_error", handleError);

        return () => {
            socket.off("connect", handleConnect);
            socket.off("disconnect", handleDisconnect);
            socketService.off("room_created", handleRoomCreated);
            socketService.off("room_joined", handleRoomJoined);
            socketService.off("game_created", handleGameCreated);
            socketService.off("game_state", handleGameState);
            socketService.off("error", handleError);
            socket.off("game_error", handleError);
        };
    }, [token, navigate]);

    const handleCreateRoom = () => {
        const socket = socketService.getSocket();
        if (!socket?.connected) {
            setStatus("⚠️ Socket chưa kết nối");
            return;
        }
        setIsLoading(true);
        setStatus("📋 Đang tạo phòng...");
        socketService.emit("create_room", {
            name: "Chess Room",
            mode: "human",
        });
    };

    const handleJoinRoom = () => {
        if (!roomCode.trim()) {
            setStatus("⚠️ Vui lòng nhập room code");
            return;
        }
        const socket = socketService.getSocket();
        if (!socket?.connected) {
            setStatus("⚠️ Socket chưa kết nối");
            return;
        }
        setIsLoading(true);
        setStatus("🎮 Đang vào phòng...");
        socketService.emit("join_room", {
            room_code: roomCode.toUpperCase(),
        });
    };

    return (
        <div style={{ padding: 30, maxWidth: 500, margin: "0 auto" }}>
            <h1 style={{ textAlign: "center", marginBottom: 30 }}>♟️ Cờ Vua Online</h1>

            {/* Connection Status */}
            <div style={{
                padding: 12,
                marginBottom: 20,
                backgroundColor: isConnected ? "#d4edda" : "#f8d7da",
                color: isConnected ? "#155724" : "#721c24",
                borderRadius: 6,
                fontSize: 15,
                fontWeight: "bold",
                textAlign: "center",
            }}>
                {isConnected ? "✓ Đã kết nối" : "⏳ Đang kết nối..."}
            </div>

            {/* Create Room Section */}
            <div style={{ marginBottom: 30 }}>
                <h3 style={{ marginBottom: 15, color: "#333" }}>1️⃣ Tạo Phòng Mới</h3>
                <button
                    onClick={handleCreateRoom}
                    disabled={!isConnected || isLoading}
                    style={{
                        padding: 12,
                        width: "100%",
                        backgroundColor: isConnected && !isLoading ? "#28a745" : "#ccc",
                        color: "white",
                        border: "none",
                        borderRadius: 6,
                        fontSize: 16,
                        fontWeight: "bold",
                        cursor: isConnected && !isLoading ? "pointer" : "not-allowed",
                        opacity: isConnected && !isLoading ? 1 : 0.6,
                    }}
                >
                    {isLoading ? "⏳ Đang tạo..." : "📋 Tạo Phòng"}
                </button>
            </div>

            {/* OR Divider */}
            <div style={{
                textAlign: "center",
                marginBottom: 30,
                color: "#999",
                fontSize: 14,
                fontWeight: "bold",
            }}>
                ─── HOẶC ───
            </div>

            {/* Join Room Section */}
            <div style={{ marginBottom: 30 }}>
                <h3 style={{ marginBottom: 15, color: "#333" }}>2️⃣ Vào Phòng Có Sẵn</h3>
                <input
                    type="text"
                    placeholder="Nhập room code (VD: ABC123)"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    disabled={!isConnected || isLoading}
                    style={{
                        padding: 12,
                        width: "100%",
                        marginBottom: 12,
                        border: "1px solid #ccc",
                        borderRadius: 6,
                        fontSize: 15,
                        opacity: isConnected ? 1 : 0.6,
                        cursor: isConnected ? "text" : "not-allowed",
                        boxSizing: "border-box",
                    }}
                />
                <button
                    onClick={handleJoinRoom}
                    disabled={!isConnected || !roomCode.trim() || isLoading}
                    style={{
                        padding: 12,
                        width: "100%",
                        backgroundColor: isConnected && !isLoading && roomCode.trim() ? "#007bff" : "#ccc",
                        color: "white",
                        border: "none",
                        borderRadius: 6,
                        fontSize: 16,
                        fontWeight: "bold",
                        cursor: isConnected && !isLoading && roomCode.trim() ? "pointer" : "not-allowed",
                        opacity: isConnected && !isLoading && roomCode.trim() ? 1 : 0.6,
                    }}
                >
                    {isLoading ? "⏳ Đang vào..." : "🎮 Vào Phòng"}
                </button>
            </div>

            {/* Status Message */}
            <div style={{
                padding: 15,
                backgroundColor: "#e7f3ff",
                color: "#004085",
                borderRadius: 6,
                minHeight: 40,
                fontSize: 15,
                border: "1px solid #b8daff",
                lineHeight: "1.5",
            }}>
                {status || "Chọn tạo phòng hoặc nhập room code để bắt đầu"}
            </div>

            {/* Game ID Display */}
            {gameId && (
                <div style={{
                    marginTop: 20,
                    padding: 10,
                    backgroundColor: "#f0f0f0",
                    borderRadius: 6,
                    fontSize: 12,
                    color: "#666",
                }}>
                    🎮 Game ID: {gameId}
                </div>
            )}
        </div>
    );
};

export default RoomJoin;