import "../../styles/game.css";

// ✅ UPDATED GameStatus component
const GameStatus = ({ 
  status, 
  currentTurn, 
  players, 
  winner,
  checkmate,
  stalemate,
  check,
  gameStatus,
  reason,
}) => {
  // Normalize players về array
  const safePlayers = Array.isArray(players) 
    ? players 
    : players 
    ? Object.values(players) 
    : [];

  // ✅ Render status message
  const renderStatus = () => {
    // ✅ Match backend status values
    switch (status) {
      case "waiting":
        return "Đang chờ người chơi...";
      case "ongoing":
        return "Đang chơi";
      case "finished":
        return "Kết thúc";
      default:
        return status || "Không xác định";
    }
  };

  // ✅ NEW: Render game end reason
  const renderGameEndReason = () => {
    if (status !== "finished") {
      return null;
    }

    switch (reason) {
      case "checkmate":
        return (
          <div className="game-end-reason checkmate">
            <strong>♔ Checkmate!</strong>
            {winner && <p>Người thắng: {winner}</p>}
          </div>
        );
      case "stalemate":
        return (
          <div className="game-end-reason stalemate">
            <strong>♚ Hòa (Stalemate)</strong>
            <p>Trò chơi hòa</p>
          </div>
        );
      case "resignation":
        return (
          <div className="game-end-reason resignation">
            <strong>🏳️ Đầu hàng</strong>
            {winner && <p>Người thắng: {winner}</p>}
          </div>
        );
      case "draw_agreed":
        return (
          <div className="game-end-reason draw">
            <strong>🤝 Đã hòa</strong>
            <p>Cả hai người chơi đã đồng ý hòa</p>
          </div>
        );
      default:
        return null;
    }
  };

  // ✅ Render turn indicator
  const renderTurn = () => {
    // ✅ FIX: Match backend status values
    if (status !== "ongoing") {
      return null;
    }
    return (
      <div className="turn">
        Lượt: <strong>{currentTurn}</strong>
      </div>
    );
  };

  // ✅ NEW: Render check indicator
  const renderCheckStatus = () => {
    if (status !== "ongoing" || !check) {
      return null;
    }
    return (
      <div className="check-indicator">
        <span className="warning">⚠️ Vua đang bị tấn công!</span>
      </div>
    );
  };

  // ✅ NEW: Render checkmate indicator
  const renderCheckmateStatus = () => {
    if (!checkmate) {
      return null;
    }
    return (
      <div className="checkmate-indicator">
        <span className="critical">♔ CHECKMATE!</span>
      </div>
    );
  };

  // ✅ NEW: Render stalemate indicator
  const renderStalemateStatus = () => {
    if (!stalemate) {
      return null;
    }
    return (
      <div className="stalemate-indicator">
        <span className="info">♚ STALEMATE</span>
      </div>
    );
  };

  // ✅ Render winner
  const renderWinner = () => {
    if (status !== "finished" || !winner) {
      return null;
    }
    return (
      <div className="winner">
        <strong>👑 Người thắng:</strong> {winner}
      </div>
    );
  };

  return (
    <div className="game-status">
      <h3>Trạng thái game</h3>

      <div className="status">{renderStatus()}</div>

      {/* Game still ongoing - show turn */}
      {renderTurn()}

      {/* Check status */}
      {renderCheckStatus()}

      {/* Checkmate status */}
      {renderCheckmateStatus()}

      {/* Stalemate status */}
      {renderStalemateStatus()}

      {/* Game ended - show reason */}
      {renderGameEndReason()}

      {/* Winner info */}
      {renderWinner()}

      {/* Players list */}
      <div className="players">
        <h4>Người chơi</h4>
        {safePlayers.length === 0 ? (
          <p>Chưa có người chơi</p>
        ) : (
          <ul>
            {safePlayers.map((p, index) => (
              <li key={index} className="player-item">
                {index === 0 ? "⚪" : "⚫"} {p?.username || p}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default GameStatus;