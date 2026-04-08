/**
 * OnlineGamePage.jsx
 *
 * Trang chơi cờ online sau khi vào phòng.
 * - PVA: người chơi đánh với AI (gọi boardApi)
 * - PVP: polling mỗi 2 giây để đồng bộ board
 *
 * Props:
 *   room       — object phòng từ API
 *   role       — "host" | "guest"
 *   onLeaveRoom() — callback để App quay về OnlinePage
 */
import { useEffect, useRef, useState, useCallback } from "react";
import Board from "../components/Board";
import StatusBar from "../components/StatusBar";
import LoadingSpinner from "../components/LoadingSpinner";
import { leaveRoom, endRoom, getRoom } from "../api/roomApi";
import { fetchBoard, sendMove, fetchLegalMoves, resetGame } from "../api/boardApi";
const POLL_MS = 2000;
const OnlineGamePage = ({ room: initialRoom, role, onLeaveRoom })=>{
    const [room,setRoom] = useState(initialRoom);
    const isPVA = initialRoom?.mode === "pva";
    const myColor = role === "host" ? initialRoom.host_color : initialRoom.host_color === "white" ? "black" : "white";
    const [board, setBoard] = useState(null);
    const [selected, setSelected] = useState(null);
    const [turn, setTurn] = useState("white");
    const [moveStatus, setMoveStatus] = useState("");
    const [gameStatus, setGameStatus] = useState({ state: "ongoing" });
    const [legalTargets, setLegalTargets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
 
    const pollRef = useRef(null);
    const isMyTurn = turn === myColor;
    // Áp dụng dữ liệu board từ API
    const applyBoardData = (data) => {
        if (data.board){ 
            setBoard(data.board);
        }
        if (data.turn){ setTurn(data.turn);}
        if (data.game_status){ setGameStatus(data.game_status);}
    // boardApi không trả legal_targets, reset về rỗng sau mỗi lần nhận board mới
    };

    // Load bàn cờ ban đầu 
    useEffect(()=>{
        const init  = async () =>{
            try{
                const data = await fetchBoard();
                applyBoardData(data);

            }
            catch(err){
                setError(err.message);
            }
            finally{
                setLoading(false);
            }
        };
        init();
    },[]);
    // Polling neu la PVP
    useEffect(()=>{
        if(isPVA){
            return;
        }
        pollRef.current = setInterval(async ()=>{
            try{
                const data = await fetchBoard();
                applyBoardData(data);
                const roomData = await getRoom(initialRoom.code);
                setRoom(roomData.room);
                if (roomData.room.status === "finished"|| roomData.room.status === "abandoned"){
                    clearInterval(pollRef.current);
                }
            }
            catch{

            }
        },POLL_MS);
        return () => clearInterval(pollRef.current);
    },[isPVA,initialRoom.code]);
    /*const applyBoardData = (data) =>{
        if(data.board){
            setBoard(data.board);
        }
        if(data.turn){
            setTurn(data.turn);
        }
        if(data.move_status !== undefined){
            setGameStatus(data.game_status);
        }
        setLegalTargets(data.legal_targets || []);
    };*/
    //  Click ô cờ
    const handleCellClick = useCallback(async(row,col)=>{
        if(!isPVA && !isMyTurn){
            setMoveStatus("Chưa đến lượt bạn");
            return;
        }
        if(gameStatus.state === "checkmate" || gameStatus.state === "stalemate"){
            return;
        }
        let data = null;
        try{
            if(!selected){
                const moves = await fetchLegalMoves(row, col);
                if(moves.length > 0){
                    setSelected({ row, col });
                    setLegalTargets(moves.map((m) => [m.row, m.col]));
                    setMoveStatus("");
                }
                else{
                    setSelected(null);
                    setLegalTargets([]);
                    setMoveStatus("Không có nước đi hợp lệ");
                }
            }
            else {
                //  Bỏ chọn nếu click lại ô đã chọn
                if(selected.row === row && selected.col === col){
                    setSelected(null);
                    setLegalTargets([]);
                    return;
                }
                // Di chuyển
                const data = await sendMove({row:selected.row,col:selected.col},{row,col});
                applyBoardData(data);
                setSelected(null);
                setLegalTargets([]);
            }
            // Kết thúc ván → cập nhật phòng
            const finalStatus =data.game_status;
            if(finalStatus?.state === "checkmate" || finalStatus?.state === "stalemate"){
                const result = finalStatus.state === "stalemate" ? "draw" : finalStatus.loser === myColor ? "loss":"win";
                await endRoom(initialRoom.code,result).catch(()=>{});
            }
            if (data.status === "invalid"){
                setMoveStatus("Nước đi không hợp lệ");
            }
        }
        catch(err){
            setMoveStatus(err.message);
            setSelected(null);
            setLegalTargets([]);
        }
    },[selected, gameStatus, isPVA, isMyTurn, myColor, initialRoom.code]);
    const isLegalTarget = useCallback((row,col)=>legalTargets.some((t)=>t[0]===row&&t[1]===col),[legalTargets]);
    const handleLeave = async () =>{
        try{
            await leaveRoom(initialRoom.code);

        }
        catch{

        }
        clearInterval(pollRef.current);
        onLeaveRoom();
    }
    const handleReset = async () =>{
        try{
            const data = await resetGame();
            applyBoardData(data);
            setSelected(null);
            setLegalTargets([]);
            setMoveStatus("");
            
        }
        catch(err){
            alert(err.message);
        }
    };
    if (loading){
         return <LoadingSpinner message="Đang tải bàn cờ..." />;
    }
    if (error){
        return <div style={{ color: "red", padding: 20 }}>Lỗi: {error}</div>;
    }
    const gameOver = gameStatus.state === "checkmate" || gameStatus.state === "stalemate";
    const roomFinished = room?.status === "finished" || room?.status === "abandoned";
    return (
        <div>
            {/* Header phòng */}
            <div style={styles.roomInfo}>
                <span style={styles.roomCode}>#{initialRoom.code}</span>
                <span style={modeBadge(room?.mode)}>{room?.mode?.toUpperCase()}</span>
            </div>
            {isPVA ?(
                <span style={styles.aiLabel}>vs AI</span>
            ):(
                <span style={styles.pvpLabel}>
                    {room?.host?.username || "Host"} vs{" "}
                    {room?.guest?.username || <span style={{ color: "#facc15" }}>Chờ đối thủ…</span>}
                </span>
            )}
            <div>
                <div style={styles.roomActions}>
                    <span style={colorBadge(myColor)}>
                        {myColor === "white" ? " Quân trắng" : " Quân đen"}
                    </span>
                    <button style={styles.btnLeave} onClick={handleLeave}> Rời phòng</button>
                </div>
            </div>
            {/* Banners */}
            {gameStatus.state === "checkmate" && (
                <Banner color="#dc2626">
                    Chiếu hết! {gameStatus.loser === "white" ? "Trắng" : "Đen"} thua!
                </Banner>
            )}
            {gameStatus.state === "stalemate" && <Banner color="#6b7280">Hòa cờ! (Stalemate)</Banner>}
            {gameStatus.state === "check" && (
                <Banner color="#d97706">
                    Chiếu! Vua {gameStatus.color === "white" ? "Trắng" : "Đen"} đang bị chiếu!
                </Banner>
            )}
            {!isPVA && !isMyTurn && !gameOver && !roomFinished && (
                <Banner color="#1d4ed8">Đang chờ đối thủ đi…</Banner>
            )}
            {room?.status === "abandoned" && <Banner color="#7c3aed">Đối thủ đã rời phòng!</Banner>}
            {/* Bàn cờ */}
            <Board
                board={board}
                selected={selected}
                isLegalTarget={isLegalTarget}
                onCellClick={handleCellClick}
            />
            <StatusBar turn={turn} moveStatus={moveStatus} />
            {(gameOver || roomFinished) && (
                <button style={styles.btnReset} onClick={handleReset}> Ván mới</button>
            )}
            {!gameOver && !roomFinished && (
                <p style={styles.hint}>{isMyTurn || isPVA ? "Click quân cờ để chọn, click ô đích để di chuyển." : "Chờ đối thủ…"}</p>
            )}
        </div>
    );

};
//Sub-components
const Banner = ({ color, children }) => (
  <div style={{ margin: "0 0 12px", padding: "10px 16px", background: color, color: "#fff", borderRadius: 8, fontWeight: 700, fontSize: 15 }}>
    {children}
  </div>
);
const modeBadge = (mode) =>({
    display: "inline-block", padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 700,
    background: mode === "pvp" ? "#3b82f6" : "#8b5cf6", color: "#fff",
});
const colorBadge = (color) => ({
  padding: "4px 10px", borderRadius: 6, fontSize: 13, fontWeight: 600,
  background: color === "white" ? "#f1f5f9" : "#1e293b",
  color: color === "white" ? "#0f172a" : "#f1f5f9",
  border: "1px solid #475569",
});
const styles = {
    page:{
        minHeight: "100vh", background: "#0f172a", color: "#f1f5f9",
        padding: "24px", fontFamily: "'Segoe UI', sans-serif", maxWidth: 700, margin: "0 auto",
    },
    roomBar:{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        flexWrap: "wrap", gap: 10, marginBottom: 20,
        padding: "12px 16px", background: "#1e293b", borderRadius: 10, border: "1px solid #334155",
    },
    roomInfo: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" },
    roomCode: { fontFamily: "monospace", fontWeight: 800, fontSize: 16, letterSpacing: 2 },
    aiLabel: { color: "#c4b5fd", fontSize: 14, fontWeight: 600 },
    pvpLabel: { color: "#94a3b8", fontSize: 14 },
    roomActions: { display: "flex", alignItems: "center", gap: 10 },
    btnLeave:{
        padding: "6px 14px", borderRadius: 6, border: "1px solid #475569",
        background: "transparent", color: "#f87171", cursor: "pointer", fontSize: 13, fontWeight: 600,
    },
    btnReset:{
        marginTop: 16, padding: "10px 24px", borderRadius: 8, border: "none",
        background: "#3b82f6", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer",
    },
    hint: { marginTop: 10, color: "#475569", fontSize: 13 },
}
export default OnlineGamePage;