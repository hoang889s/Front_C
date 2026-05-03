import { useEffect,useState } from "react";
import { useNavigate } from "react-router-dom";
import { socketService } from "../../services/socket/socketService";
import { useAuthLogic } from "../../hooks/useAuth";
const RoomCreate = () => {
    const navigate = useNavigate();
    const { token } = useAuthLogic();
    const [color, setColor] = useState("white");

    
    useEffect(() => {
        if(!token){
            return;
        }
        socketService.connect(token);



        const handleRoomCreated = (data) => {
            console.log("Room:", data);
            socketService.emit("create_game", {
                room_code: data.room_code
            });
        };
        const handleGameCreated = (data) => {
            console.log("Game:", data);
            navigate(`/game/${data.game_id}`);
        };
        const handleError = (err) => {
            console.error("Socket error:", err);
        };
        socketService.on("room_created", handleRoomCreated);
        socketService.on("game_created", handleGameCreated);
        socketService.on("error", handleError);
        return () => {
            socketService.off("room_created", handleRoomCreated);
            socketService.off("game_created", handleGameCreated);
            socketService.off("error", handleError);
        };
    },[token,navigate]);
    const handleCreateRoom = () => {
        socketService.emit("create_room",{
            color: color,
        });
        //console.log("Emitted create_room");
    };
    return (
        <div>
            <h2>Tạo phòng</h2>
            <div>
                <label>
                    <input
                        type="radio"
                        value="white"
                        checked={color === "white"}
                        onChange={(e) => setColor(e.target.value)}
                    />
                    Trắng
                </label>
                <label>
                    <input
                        type="radio"
                        value="black"
                        checked={color === "black"}
                        onChange={(e) => setColor(e.target.value)}
                    />
                    Đen
                </label>
            </div>
            <button onClick={handleCreateRoom}>
                Tạo phòng & bắt đầu chơi
            </button>
        </div>
    );

};
export default RoomCreate;