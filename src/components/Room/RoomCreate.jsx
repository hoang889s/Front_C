import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { socketService } from "../../services/socket/socketService";
import { useAuthLogic } from "../../hooks/useAuth";
import "../../styles/roomcreate.css";


const RoomCreate = () => {
    const navigate = useNavigate();
    const { token } = useAuthLogic();
    
    // State management
    const [mode, setMode] = useState("human"); // "human" hoặc "ai"
    const [color, setColor] = useState("white");
    const [roomCode, setRoomCode] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!token) {
            return;
        }

        socketService.connect(token);

        // Event: Phòng được tạo
        const handleRoomCreated = (data) => {
            console.log("[RoomCreate] Room created:", data);
            setRoomCode(data.room_code);
            setLoading(false);

            // Nếu chế độ AI: Tạo game trực tiếp
            if (mode === "ai") {
                console.log("[RoomCreate] AI mode detected, creating game...");
                socketService.emit("create_game", {
                    room_code: data.room_code,
                    mode: "ai"
                });
            }
            // Nếu chế độ Human: Chờ người chơi thứ 2 join
            else {
                console.log("[RoomCreate] Human mode, waiting for opponent...");
                // Có thể hiển thị thông báo "Chờ đối thủ..."
            }
        };

        // Event: Game được tạo
        const handleGameCreated = (data) => {
            console.log("[RoomCreate] Game created:", data);
            setLoading(false);
            // Chuyển đến trang game
            navigate(`/game/${data.game_id}`);
        };

        // Event: User join room (cho chế độ human)
        const handleUserJoined = (data) => {
            console.log("[RoomCreate] User joined:", data);
            // Game sẽ tự động được tạo khi có 2 người
        };

        // Event: Game state (tự động được emit khi có 2 người)
        const handleGameState = (data) => {
            console.log("[RoomCreate] Game state received:", data);
            // Game đã sẵn sàng
        };

        // Event: Lỗi
        const handleError = (err) => {
            console.error("[RoomCreate] Socket error:", err);
            setError(err.message || "Có lỗi xảy ra");
            setLoading(false);
        };

        socketService.on("room_created", handleRoomCreated);
        socketService.on("game_created", handleGameCreated);
        socketService.on("user_joined", handleUserJoined);
        socketService.on("game_state", handleGameState);
        socketService.on("error", handleError);

        return () => {
            socketService.off("room_created", handleRoomCreated);
            socketService.off("game_created", handleGameCreated);
            socketService.off("user_joined", handleUserJoined);
            socketService.off("game_state", handleGameState);
            socketService.off("error", handleError);
        };
    }, [token, navigate, mode]);

    const handleCreateRoom = () => {
        if (loading) return;

        setLoading(true);
        setError(null);

        console.log(`[RoomCreate] Creating room - Mode: ${mode}, Color: ${color}`);
        
        socketService.emit("create_room", {
            color: color,
            mode: mode // Truyền mode lên backend
        });
    };

    return (
        <div className="room-create-container">
            <div className="room-create-card">
                <h2>🎮 Tạo Phòng Chơi</h2>

                {error && <div className="error-alert">❌ {error}</div>}

                {roomCode && mode === "human" && !loading && (
                    <div className="success-alert">
                        ✅ Phòng đã sẵn sàng: <strong>{roomCode}</strong>
                        <p style={{fontSize: '0.8rem', marginTop: '5px'}}>Đang đợi đối thủ tham gia...</p>
                    </div>
                )}

                {/* Lựa chọn Chế độ chơi */}
                <div className="form-group">
                    <label className="section-label">Chế độ chơi:</label>
                    <div className="options-group">
                        <label className="option-item">
                            <input
                                type="radio"
                                value="human"
                                checked={mode === "human"}
                                onChange={(e) => {
                                    setMode(e.target.value);
                                    setRoomCode(null);
                                }}
                                disabled={loading}
                            />
                            <div className="option-content">
                                <span>👥</span>
                                <strong>Người</strong>
                            </div>
                        </label>
                        <label className="option-item">
                            <input
                                type="radio"
                                value="ai"
                                checked={mode === "ai"}
                                onChange={(e) => {
                                    setMode(e.target.value);
                                    setRoomCode(null);
                                }}
                                disabled={loading}
                            />
                            <div className="option-content">
                                <span>🤖</span>
                                <strong>Máy (AI)</strong>
                            </div>
                        </label>
                    </div>
                </div>

                {/* Lựa chọn Màu quân */}
                <div className="form-group">
                    <label className="section-label">Chọn phe của bạn:</label>
                    <div className="options-group">
                        <label className="option-item">
                            <input
                                type="radio"
                                value="white"
                                checked={color === "white"}
                                onChange={(e) => setColor(e.target.value)}
                                disabled={loading}
                            />
                            <div className="option-content">
                                <span>⚪</span>
                                <strong>Quân Trắng</strong>
                            </div>
                        </label>
                        <label className="option-item">
                            <input
                                type="radio"
                                value="black"
                                checked={color === "black"}
                                onChange={(e) => setColor(e.target.value)}
                                disabled={loading}
                            />
                            <div className="option-content">
                                <span>⚫</span>
                                <strong>Quân Đen</strong>
                            </div>
                        </label>
                    </div>
                </div>

                {/* Box thông tin */}
                <div className="info-box">
                    {mode === "human" ? (
                        <p>📱 Gửi mã phòng cho bạn bè để bắt đầu trận đấu 1vs1.</p>
                    ) : (
                        <p>🤖 Bạn sẽ đấu với AI. Trận đấu sẽ bắt đầu ngay sau khi tạo.</p>
                    )}
                </div>

                {/* Nút thao tác */}
                <button
                    className="btn-create"
                    onClick={handleCreateRoom}
                    disabled={loading}
                >
                    {loading ? (
                        <><div className="spinner"></div> Đang tạo...</>
                    ) : (
                        <>🚀 {mode === "ai" ? "Bắt đầu chơi AI" : "Tạo phòng chờ"}</>
                    )}
                </button>

                {roomCode && mode === "human" && !loading && (
                    <button
                        className="btn-copy"
                        onClick={() => {
                            navigator.clipboard.writeText(roomCode);
                            alert("Đã copy mã phòng!");
                        }}
                    >
                        📋 Copy mã phòng gửi bạn bè
                    </button>
                )}
            </div>
        </div>
    );
};

export default RoomCreate;