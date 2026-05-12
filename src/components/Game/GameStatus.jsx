import "../../styles/game.css";
import "../../styles/game-status.css"; 

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
  isAI, 
  aiThinking, 
}) => {
  
  const getPlayers = () => {
    if (!players) return { white: null, black: null };

    if (players.white && players.black) {
      return players;
    }

    if (Array.isArray(players)) {
      return {
        white: players[0] || null,
        black: players[1] || null,
      };
    }

    return { white: null, black: null };
  };

  const safePlayers = getPlayers();

  
  const getPlayerName = (color) => {
    const player = safePlayers[color];

    if (isAI) {
      // AI game - hiển thị "🤖 AI" hoặc username
      if (color === "white") {
        return (
          <>
            {players?.white === "AI" ? " AI" : ` ${player?.username || "White"}`}
          </>
        );
      } else {
        return (
          <>
            {players?.black === "AI" ? " AI" : ` ${player?.username || "Black"}`}
          </>
        );
      }
    }

    // Human game
    return `${color === "white" ? "⚪" : "⚫"} ${player?.username || `Player ${color}`}`;
  };

  
  const renderStatus = () => {
    if (gameStatus && gameStatus !== "ongoing") {
      return getGameEndMessage();
    }

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

  
  const getGameEndMessage = () => {
    if (gameStatus === "ongoing") return "Đang chơi";

    switch (reason) {
      case "checkmate":
        return "♔ Chiếu bí!";
      case "stalemate":
        return "♚ Hòa (Bế tắc)";
      case "resignation":
        return " Đầu hàng";
      case "draw_agreed":
        return " Đã hòa";
      default:
        return `Kết thúc (${reason || gameStatus})`;
    }
  };

  
  const renderGameEndReason = () => {
    if (gameStatus === "ongoing") {
      return null;
    }

    switch (reason) {
      case "checkmate":
        return (
          <div>
            <strong>♔ Chiếu bí!</strong>
            {winner && (
              <p>
                Người thắng:{" "}
                {isAI
                  ? winner === "white"
                    ? "⚪ Quân Trắng"
                    : "⚫ Quân Đen"
                  : `Player ${winner}`}
              </p>
            )}
          </div>
        );
      case "stalemate":
        return (
          <div >
            <strong>♚ Hòa (Bế tắc)</strong>
            <p>Trò chơi hòa - Bất cứ bên nào cũng không có nước đi hợp lệ</p>
          </div>
        );
      case "resignation":
        return (
          <div >
            <strong> Đầu hàng</strong>
            {winner && (
              <p>
                Người thắng:{" "}
                {isAI
                  ? winner === "white"
                    ? "⚪ Quân Trắng"
                    : "⚫ Quân Đen"
                  : `Player ${winner}`}
              </p>
            )}
          </div>
        );
      case "draw_agreed":
        return (
          <div >
            <strong> Đã hòa</strong>
            <p>Cả hai người chơi đã đồng ý hòa</p>
          </div>
        );
      default:
        return null;
    }
  };

  
  const renderTurn = () => {
    if (gameStatus !== "ongoing") {
      return null;
    }

    const turnColor = currentTurn === "white" ? "⚪ Trắng" : "⚫ Đen";
    const isAITurn = isAI && (
      (currentTurn === "white" && safePlayers.white === "AI") ||
      (currentTurn === "black" && safePlayers.black === "AI")
    );

    return (
      <div className={`turn ${isAITurn ? "ai-turn" : "human-turn"}`}>
        <span >Lượt:</span>
        <span >{turnColor}</span>
        {isAITurn && <span ></span>}
      </div>
    );
  };

  
  const renderCheckStatus = () => {
    if (gameStatus !== "ongoing" || !check) {
      return null;
    }

    return (
      <div >
        <span ></span>
        <span >Vua đang bị tấn công!</span>
      </div>
    );
  };

  
  const renderCheckmateStatus = () => {
    if (!checkmate) {
      return null;
    }

    return (
      <div >
        <span >♔</span>
        <span >CHIẾU BÍ!</span>
      </div>
    );
  };

  
  const renderStalemateStatus = () => {
    if (!stalemate) {
      return null;
    }

    return (
      <div >
        <span >♚</span>
        <span >BẾ TẮC - HÒA</span>
      </div>
    );
  };

  
  const renderAIThinking = () => {
    if (!isAI || !aiThinking) {
      return null;
    }

    return (
      <div >
        <span ></span>
        <span > AI đang suy nghĩ...</span>
      </div>
    );
  };

  
  const renderWinner = () => {
    if (gameStatus === "ongoing" || !winner) {
      return null;
    }

    const winnerName = isAI
      ? winner === "white"
        ? "⚪ Quân Trắng"
        : "⚫ Quân Đen"
      : `Player ${winner}`;

    return (
      <div >
        <strong> Người thắng:</strong>
        <span >{winnerName}</span>
      </div>
    );
  };

  
  const renderPlayerInfo = () => {
    if (!isAI) {
      return null;
    }

    return (
      <div >
        <div >
          <span >⚪ Trắng</span>
          <span >{getPlayerName("white")}</span>
          {currentTurn === "white" && <span className="turn-dot">●</span>}
        </div>
        <div ></div>
        <div >
          <span >⚫ Đen</span>
          <span >{getPlayerName("black")}</span>
          {currentTurn === "black" && <span className="turn-dot">●</span>}
        </div>
      </div>
    );
  };

  
  const renderPlayersList = () => {
    if (isAI) {
      return null; 
    }

    return (
      <div >
        <h4>Người chơi</h4>
        <div >
          <div >
            <span >⚪</span>
            <span >{safePlayers.white?.username || "White"}</span>
          </div>
          <div >
            <span >⚫</span>
            <span >{safePlayers.black?.username || "Black"}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div >
      <div >
        <h3>Trạng thái game</h3>
        {/* ✨ MỚI: AI badge */}
        {isAI && (
          <span >
             AI
          </span>
        )}
      </div>

      {/* ✨ MỚI: AI thinking indicator */}
      {renderAIThinking()}

      {/* Main status */}
      <div >{renderStatus()}</div>

      {/* Game ongoing - show turn */}
      {renderTurn()}

      {/* Check warning */}
      {renderCheckStatus()}

      {/* Checkmate indicator */}
      {renderCheckmateStatus()}

      {/* Stalemate indicator */}
      {renderStalemateStatus()}

      {/* Game ended - show reason */}
      {renderGameEndReason()}

      {/* Winner info */}
      {renderWinner()}

      {/* Players info */}
      {isAI ? renderPlayerInfo() : renderPlayersList()}
    </div>
  );
};

export default GameStatus;