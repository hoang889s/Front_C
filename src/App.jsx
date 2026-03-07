import Board from "./components/Board";
import LoadingSpinner from "./components/LoadingSpinner";
import StatusBar from "./components/StatusBar";
import useBoard from "./hooks/useBoard";

const App = () => {
  const { board, loading, error, selected, turn, moveStatus,gameStatus,isLegalTarget, handleCellClick,resetGame, } = useBoard();

  if (loading) return <LoadingSpinner message="Đang tải bàn cờ..." />;
  if (error)   return <div style={{ color: "red", padding: 20 }}>Lỗi: {error}</div>;

  return (
    <div style={{ padding: "30px", fontFamily: "sans-serif" }}>
      <h2 style={{ marginBottom: "16px" }}> Chess</h2>
      {/* Thông báo chiếu / chiếu hết / hòa */}
      {gameStatus.state === "checkmate"&&(
        <div style={bannerStyle("red")}>
          Chiếu hết! {gameStatus.loser === "white" ? "Trắng" : "Đen"} thua!
        </div>
      )}
      {gameStatus.state ==="stalemate"&&(
        <div style={bannerStyle("gray")}> 
          Hòa cờ! (Stalemate)
        </div>
      )}
      {gameStatus.state === "check"&&(
        <div style={bannerStyle("orange")}>
          Chiếu! Vua {gameStatus.color === "white" ? "Trắng" : "Đen"} đang bị chiếu!
        </div>
      )}
      <Board
        board={board}
        selected={selected}
        isLegalTarget={isLegalTarget}
        onCellClick={handleCellClick}
      />

      <StatusBar turn={turn} moveStatus={moveStatus} />

      <p style={{ marginTop: "10px", color: "#888", fontSize: "13px" }}>
        Click quân cờ để chọn, click ô đích để di chuyển.
      </p>
      <button onClick={resetGame} style={resetBtnStyle}>
        Chơi lại
      </button>
    </div>
  );
};
const bannerStyle = (color) => ({
  marginBottom: "12px",
  padding: "10px 16px",
  backgroundColor: color,
  color: "white",
  borderRadius: "6px",
  fontWeight: "bold",
  fontSize: "15px",
});

const resetBtnStyle = {
  marginTop: "16px",
  padding: "8px 20px",
  fontSize: "14px",
  cursor: "pointer",
  borderRadius: "6px",
  border: "1px solid #ccc",
  backgroundColor: "#f5f5f5",
};
export default App;