/**
 * Hiển thị lượt chơi và kết quả nước đi.
 * @param {"white"|"black"} turn
 * @param {"thinking"|"ok"|"invalid"|null} moveStatus
 */
const StatusBar = ({turn,moveStatus})=>{
    // trả về các thông điệp của server
    const getMessage = ()=>{
        if(moveStatus === "thinking"){
            return "Đang suy nghĩ...";
        }
        if(moveStatus === "invalid"){
            return "Nước đi không hợp lệ";
        }
        if(moveStatus === "checkmate"){
            return "Chiếu hết";
        }
        if(moveStatus === "check"){
            return "Chiếu tướng";
        }
    }
    // màu sắc 
    const color =
        moveStatus === "invalid"   ? "#c0392b" :
        moveStatus === "thinking"  ? "#8e44ad" :
        moveStatus === "checkmate" ? "#27ae60" :
        turn === "white"           ? "#2c3e50" : "#ecf0f1";
    // màu nền
    const bg =
        moveStatus === "invalid"   ? "#fdecea" :
        moveStatus === "thinking"  ? "#f3e5f5" :
        moveStatus === "checkmate" ? "#eafaf1" :
        turn === "white"           ? "#ecf0f1" : "#2c3e50";
    return (
        <div
            style={{
            marginTop: "12px",
            padding: "10px 20px",
            borderRadius: "8px",
            background: bg,
            color: color,
            fontFamily: "monospace",
            fontSize: "16px",
            fontWeight: "bold",
            width: "fit-content",
            transition: "all 0.3s ease",
            boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
            minWidth: "240px",
            textAlign: "center",
        }}
        >
            {getMessage()}
        </div>
  );

}
export default StatusBar;