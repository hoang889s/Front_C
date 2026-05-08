import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGame } from "../hooks/useGame";
import { useAuth } from "../context/AuthContext";

// Components
import Board from "../components/Game/Board";
import MoveHistory from "../components/Game/MoveHistory";
import GameStatus from "../components/Game/GameStatus";
import Loading from "../components/Common/Loading";

import { isPromotionMove, createPromotionMove } from "../utils/Promotionutils";
import "../styles/promotion-dialog.css";
import "../styles/ai-indicator.css"; // ✨ THÊM CSS CHO AI

const GamePage = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();

  const {
    gameState,
    connected,
    joinGame,
    makeMove,
    resign,
    offerDraw,
    acceptDraw,
    rejectDraw,
    leaveGame,
    setCurrentUserId, // ✨ MỚI: Set user ID để detect AI game
  } = useGame(token);

  const joinedGameIdRef = useRef(null);

  // State cho draw dialog
  const [drawOffer, setDrawOffer] = useState(null);

  // State cho pawn promotion
  const [promotionData, setPromotionData] = useState(null);

  // ✨ MỚI: State cho AI notification
  const [aiNotification, setAINotification] = useState(null);

  // ✨ MỚI: Set user ID vào gameState hook
  useEffect(() => {
    if (user?.id) {
      setCurrentUserId(user.id);
    }
  }, [user?.id, setCurrentUserId]);

  // Listen cho custom events từ socket
  useEffect(() => {
    const handleDrawOffered = (e) => {
      const { gameId: offeredGameId, offeredBy, offeredByName } = e.detail;
      console.log("[GamePage] Draw offered:", e.detail);

      if (offeredGameId === gameState.gameId) {
        setDrawOffer({
          offeredBy,
          offeredByName,
        });
      }
    };

    const handleDrawOfferSent = (e) => {
      console.log("[GamePage] Draw offer sent:", e.detail);
      // Show notification
      showNotification("Đã gửi đề nghị hòa");
    };

    const handleDrawRejected = (e) => {
      const { rejectedByName } = e.detail;
      console.log("[GamePage] Draw rejected by:", rejectedByName);
      setDrawOffer(null);
      showNotification(`${rejectedByName} đã từ chối lời đề nghị hòa`);
    };

    window.addEventListener("drawOffered", handleDrawOffered);
    window.addEventListener("drawOfferSent", handleDrawOfferSent);
    window.addEventListener("drawRejected", handleDrawRejected);

    return () => {
      window.removeEventListener("drawOffered", handleDrawOffered);
      window.removeEventListener("drawOfferSent", handleDrawOfferSent);
      window.removeEventListener("drawRejected", handleDrawRejected);
    };
  }, [gameState.gameId]);

  // Join game khi vào page
  useEffect(() => {
    if (!gameId || !connected) {
      console.warn("[GAME_PAGE] No gameId in URL or not connected");
      return;
    }
    const id = parseInt(gameId);
    if (joinedGameIdRef.current === id) {
      return;
    }
    console.log("[JOIN]", id);
    joinGame(id);
    joinedGameIdRef.current = id;
    return () => {
      if (joinedGameIdRef.current === id) {
        console.log("[GAME_PAGE] Leaving game:", id);
        leaveGame(id);
        joinedGameIdRef.current = null;
      }
    };
  }, [gameId, connected, joinGame, leaveGame]);

  console.log("=== GAME PAGE RENDER ===");
  console.log("gameState:", gameState);
  console.log("isAI:", gameState.isAI);
  console.log("aiThinking:", gameState.aiThinking);
  console.log("connected:", connected);

  // ✨ MỚI: Hàm show notification
  const showNotification = (message) => {
    setAINotification(message);
    setTimeout(() => setAINotification(null), 3000);
  };

  // ✨ MỚI: Xác định ai là current player và opponent
  const isWhitePlayer = user?.id === gameState.white;
  const isBlackPlayer = user?.id === gameState.black;
  const currentPlayerColor = gameState.turn;

  // ✨ MỚI: Xác định opponent name
  const getOpponentName = () => {
    if (gameState.isAI) {
      // AI game
      if (isWhitePlayer) {
        return "🤖 AI (Quân Đen)";
      } else {
        return "🤖 AI (Quân Trắng)";
      }
    } else {
      // Human vs Human
      const opponentId = isWhitePlayer ? gameState.black : gameState.white;
      return `Player ${opponentId}`;
    }
  };

  // ✨ MỚI: Kiểm tra xem player hiện tại có phải current player không
  const isCurrentPlayerTurn =
    (isWhitePlayer && gameState.turn === "white") ||
    (isBlackPlayer && gameState.turn === "black");

  // ✨ MỚI: Kiểm tra xem board có bị disable không
  const isBoardDisabled =
    gameState.status !== "ongoing" ||
    gameState.aiThinking || // Disable khi AI suy nghĩ
    !isCurrentPlayerTurn; // Disable khi không phải lượt của player

  // Chưa connect
  if (!connected) {
    return <Loading />;
  }

  // Chưa có game
  if (!gameState?.gameId) {
    return <Loading />;
  }

  const handleMove = (move) => {
    // ✨ THÊM: Kiểm tra board có bị disable không
    if (isBoardDisabled) {
      console.log("[GamePage] Move blocked - board disabled");
      if (gameState.aiThinking) {
        showNotification("AI đang suy nghĩ, vui lòng chờ...");
      } else if (!isCurrentPlayerTurn) {
        showNotification("Không phải lượt của bạn");
      }
      return;
    }

    // Kiểm tra xem có phải pawn promotion không
    console.log("MOVE:", move);
    console.log("BOARD:", gameState.board);
    if (isPromotionMove(move, gameState.board)) {
      console.log("PROMOTION DETECTED");
      setPromotionData({
        move,
        color: gameState.turn,
      });
      return;
    }

    // Không phải promotion, send move ngay
    makeMove(move);
  };

  const handleCompletePromotion = (promotionPiece) => {
    if (!promotionData) {
      return;
    }
    console.log("[GamePage] Completing promotion with:", promotionPiece);
    const moveWithPromotion = createPromotionMove(
      promotionData.move,
      promotionPiece
    );
    console.log("[GamePage] Sending move:", moveWithPromotion);

    makeMove(moveWithPromotion);
    setPromotionData(null);
  };

  const handleResign = () => {
    const confirmed = window.confirm("Bạn chắc chắn muốn đầu hàng?");
    if (!confirmed) return;

    console.log("[GamePage] Resigning...");
    resign();
  };

  const handleOfferDraw = () => {
    // ✨ MỚI: Trong AI mode, không cho phép offer draw (AI auto accept)
    if (gameState.isAI) {
      showNotification("AI sẽ tự động chấp nhận lời đề nghị hòa");
    }
    console.log("[GamePage] Offering draw...");
    offerDraw();
  };

  const handleAcceptDraw = () => {
    console.log("[GamePage] Accepting draw...");
    acceptDraw();
    setDrawOffer(null);
  };

  const handleRejectDraw = () => {
    console.log("[GamePage] Rejecting draw...");
    rejectDraw();
    setDrawOffer(null);
  };

  const handleLeave = () => {
    if (gameState.gameStatus !== "ongoing") {
      // Game đã kết thúc, thoát luôn
      if (gameId) {
        leaveGame(parseInt(gameId));
      }
      navigate("/");
    } else {
      // Game đang diễn ra, hỏi xác nhận
      const confirmed = window.confirm(
        "Nếu bạn thoát, bạn sẽ bị xem như đã đầu hàng. Tiếp tục?"
      );
      if (confirmed) {
        resign();
        if (gameId) {
          leaveGame(parseInt(gameId));
        }
        navigate("/");
      }
    }
  };

  return (
    <div className="game-page">
      {/* ✨ MỚI: AI Indicator */}
      {gameState.isAI && (
        <div className="ai-indicator-bar">
          <span className="ai-badge">🤖 Chơi với AI</span>
          {gameState.aiThinking && (
            <span className="ai-thinking">
              <span className="spinner"></span>
              AI đang suy nghĩ...
            </span>
          )}
        </div>
      )}

      {/* ✨ MỚI: Notification */}
      {aiNotification && (
        <div className="game-notification">
          {aiNotification}
        </div>
      )}

      <div className="game-container">
        {/* LEFT: BOARD */}
        <div className="game-board">
          {/* ✨ MỚI: Overlay khi AI suy nghĩ hoặc không phải lượt */}
          {isBoardDisabled && gameState.aiThinking && (
            <div className="board-overlay ai-thinking">
              <div className="overlay-content">
                <span className="spinner-large"></span>
                <p>🤖 AI đang suy nghĩ...</p>
              </div>
            </div>
          )}

          {isBoardDisabled && !gameState.aiThinking && !isCurrentPlayerTurn && (
            <div className="board-overlay waiting">
              <div className="overlay-content">
                <p>⏳ Chờ lượt của bạn...</p>
              </div>
            </div>
          )}

          <Board
            board={gameState.board}
            currentTurn={gameState.turn}
            status={gameState.status}
            onMove={handleMove}
            disabled={isBoardDisabled}
          />
        </div>

        {/* RIGHT: INFO PANEL */}
        <div className="game-sidebar">
          {gameState.roomCode && (
            <div className="room-box">
              <p>Room Code:</p>
              <h3>{gameState.roomCode}</h3>
              <button
                onClick={() =>
                  navigator.clipboard.writeText(gameState.roomCode)
                }
              >
                Copy
              </button>
            </div>
          )}

          {/* ✨ MỚI: Player Info Box (AI Mode) */}
          {gameState.isAI && (
            <div className="player-info-box ai-mode">
              <div className="player-row white">
                <span className="player-color">♟ Trắng</span>
                <span className="player-name">
                  {isWhitePlayer ? "👤 Bạn" : "🤖 AI"}
                </span>
                {gameState.turn === "white" && (
                  <span className="turn-indicator">●</span>
                )}
              </div>
              <div className="divider"></div>
              <div className="player-row black">
                <span className="player-color">♟ Đen</span>
                <span className="player-name">
                  {isBlackPlayer ? "👤 Bạn" : "🤖 AI"}
                </span>
                {gameState.turn === "black" && (
                  <span className="turn-indicator">●</span>
                )}
              </div>
            </div>
          )}

          {/* ✨ MỚI: Player Info Box (Human Mode) */}
          {!gameState.isAI && (
            <div className="player-info-box human-mode">
              <div className="player-row white">
                <span className="player-color">♟ Trắng</span>
                <span className="player-name">
                  {isWhitePlayer ? "👤 Bạn" : `Player ${gameState.white}`}
                </span>
                {gameState.turn === "white" && (
                  <span className="turn-indicator">●</span>
                )}
              </div>
              <div className="divider"></div>
              <div className="player-row black">
                <span className="player-color">♟ Đen</span>
                <span className="player-name">
                  {isBlackPlayer ? "👤 Bạn" : `Player ${gameState.black}`}
                </span>
                {gameState.turn === "black" && (
                  <span className="turn-indicator">●</span>
                )}
              </div>
            </div>
          )}

          <GameStatus
            status={gameState.status}
            currentTurn={gameState.turn}
            players={{
              white: gameState.white,
              black: gameState.black,
            }}
            winner={gameState.winner}
            checkmate={gameState.checkmate}
            stalemate={gameState.stalemate}
            check={gameState.check}
            gameStatus={gameState.gameStatus}
            reason={gameState.reason}
            isAI={gameState.isAI} // ✨ MỚI: Pass AI flag
          />

          <MoveHistory moves={gameState.moves || []} />

          {/* Game control buttons */}
          {gameState.status === "ongoing" && (
            <div className="game-controls">
              <button
                className="btn-resign"
                onClick={handleResign}
                title="Đầu hàng"
                disabled={gameState.aiThinking}
              >
                🏳️ Đầu hàng
              </button>
              {!gameState.isAI && (
                <button
                  className="btn-draw"
                  onClick={handleOfferDraw}
                  title="Đề nghị hòa"
                  disabled={gameState.aiThinking}
                >
                  🤝 Đề nghị hòa
                </button>
              )}
              {gameState.isAI && (
                <button
                  className="btn-draw"
                  onClick={handleOfferDraw}
                  title="Đề nghị hòa (AI sẽ auto chấp nhận)"
                  disabled={gameState.aiThinking}
                >
                  🤝 Đề nghị hòa
                </button>
              )}
            </div>
          )}

          {/* Pawn promotion dialog */}
          {promotionData && (
            <div className="promotion-dialog">
              <h4>Phong quân</h4>
              <p>Chọn quân để nâng lên:</p>
              <div className="promotion-options">
                <button
                  className="promotion-btn queen"
                  onClick={() => handleCompletePromotion("Q")}
                  title="Hậu"
                >
                  ♕ Hậu
                </button>
                <button
                  className="promotion-btn rook"
                  onClick={() => handleCompletePromotion("R")}
                  title="Xe"
                >
                  ♖ Xe
                </button>
                <button
                  className="promotion-btn bishop"
                  onClick={() => handleCompletePromotion("B")}
                  title="Tượng"
                >
                  ♗ Tượng
                </button>
                <button
                  className="promotion-btn knight"
                  onClick={() => handleCompletePromotion("N")}
                  title="Mã"
                >
                  ♘ Mã
                </button>
              </div>
            </div>
          )}

          {/* Draw offer dialog */}
          {drawOffer && (
            <div className="draw-offer-dialog">
              <h4>Đề nghị hòa</h4>
              <p>{drawOffer.offeredByName} đề nghị hòa cả trò chơi</p>
              <div className="dialog-actions">
                <button className="btn-accept" onClick={handleAcceptDraw}>
                  ✓ Chấp nhận
                </button>
                <button className="btn-reject" onClick={handleRejectDraw}>
                  ✗ Từ chối
                </button>
              </div>
            </div>
          )}

          <button className="leave-btn" onClick={handleLeave}>
            Thoát Game
          </button>
        </div>
      </div>
    </div>
  );
};

export default GamePage;