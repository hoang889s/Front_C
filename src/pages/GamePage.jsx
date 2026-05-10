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

import "../styles/game-page.css";
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
    setCurrentUserId,
  } = useGame(token);
 
  const joinedGameIdRef = useRef(null);
  const [drawOffer, setDrawOffer] = useState(null);
  const [promotionData, setPromotionData] = useState(null);
  const [aiNotification, setAINotification] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
 
  useEffect(() => {
    if (user?.id) {
      setCurrentUserId(user.id);
    }
  }, [user?.id, setCurrentUserId]);
 
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
 
  const showNotification = (message) => {
    setAINotification(message);
    setTimeout(() => setAINotification(null), 3000);
  };
 
  const isWhitePlayer = user?.id === gameState.white;
  const isBlackPlayer = user?.id === gameState.black;
 
  const isBoardDisabled =
    gameState.status !== "ongoing" || gameState.aiThinking;
 
  if (!connected) {
    return <Loading />;
  }
 
  if (!gameState?.gameId) {
    return <Loading />;
  }
 
  const handleMove = (move) => {
    if (isBoardDisabled) {
      console.log("[GamePage] Move blocked - board disabled");
      if (gameState.aiThinking) {
        showNotification("AI đang suy nghĩ, vui lòng chờ...");
      }
      return;
    }
 
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
      if (gameId) {
        leaveGame(parseInt(gameId));
      }
      navigate("/");
    } else {
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
    <div className="game-page-wrapper">
      {/* NAVBAR */}
      <nav className="game-navbar">
        <div className="navbar-content">
          <div className="navbar-left">
            <button
              className="menu-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle sidebar"
            >
              ☰
            </button>
            <h1 className="navbar-title">♟️ Chess Arena</h1>
          </div>
 
          {gameState.isAI && (
            <div className="ai-indicator">
              <span className="ai-badge">🤖 AI Mode</span>
              {gameState.aiThinking && (
                <span className="ai-thinking">
                  <span className="pulse-dot"></span>
                  AI đang suy nghĩ...
                </span>
              )}
            </div>
          )}
 
          <div className="navbar-right">
            <span className="room-code">
              Room: <strong>{gameState.roomCode || "—"}</strong>
            </span>
            <button
              className="copy-btn"
              onClick={() =>
                gameState.roomCode &&
                navigator.clipboard.writeText(gameState.roomCode)
              }
              title="Copy room code"
            >
              📋
            </button>
          </div>
        </div>
      </nav>
 
      {/* NOTIFICATION */}
      {aiNotification && (
        <div className="notification">
          <p>{aiNotification}</p>
        </div>
      )}
 
      {/* MAIN CONTAINER */}
      <div className="game-container">
        {/* LEFT: BOARD */}
        <div className="board-section">
          <div className="board-wrapper">
            <Board
              board={gameState.board}
              currentTurn={gameState.turn}
              status={gameState.status}
              onMove={handleMove}
              disabled={isBoardDisabled}
            />
          </div>
        </div>
 
        {/* RIGHT: SIDEBAR */}
        <div className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
          <div className="sidebar-content">
            {/* PLAYER INFO */}
            <div className="player-info-section">
              <h3 className="section-title">Players</h3>
              {gameState.isAI ? (
                <div className="player-info-ai">
                  <div className={`player-row white ${gameState.turn === "white" ? "active" : ""}`}>
                    <span className="player-piece">♟</span>
                    <div className="player-details">
                      <span className="player-label">White</span>
                      <span className="player-name">
                        {isWhitePlayer ? "👤 You" : "🤖 AI"}
                      </span>
                    </div>
                    {gameState.turn === "white" && <span className="turn-indicator">●</span>}
                  </div>
                  <div className="divider"></div>
                  <div className={`player-row black ${gameState.turn === "black" ? "active" : ""}`}>
                    <span className="player-piece">♟</span>
                    <div className="player-details">
                      <span className="player-label">Black</span>
                      <span className="player-name">
                        {isBlackPlayer ? "👤 You" : "🤖 AI"}
                      </span>
                    </div>
                    {gameState.turn === "black" && <span className="turn-indicator">●</span>}
                  </div>
                </div>
              ) : (
                <div className="player-info-human">
                  <div className={`player-row white ${gameState.turn === "white" ? "active" : ""}`}>
                    <span className="player-piece">♟</span>
                    <div className="player-details">
                      <span className="player-label">White</span>
                      <span className="player-name">
                        {isWhitePlayer ? "👤 You" : `Player ${gameState.white}`}
                      </span>
                    </div>
                    {gameState.turn === "white" && <span className="turn-indicator">●</span>}
                  </div>
                  <div className="divider"></div>
                  <div className={`player-row black ${gameState.turn === "black" ? "active" : ""}`}>
                    <span className="player-piece">♟</span>
                    <div className="player-details">
                      <span className="player-label">Black</span>
                      <span className="player-name">
                        {isBlackPlayer ? "👤 You" : `Player ${gameState.black}`}
                      </span>
                    </div>
                    {gameState.turn === "black" && <span className="turn-indicator">●</span>}
                  </div>
                </div>
              )}
            </div>
 
            {/* GAME STATUS */}
            <div className="game-status-section">
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
                isAI={gameState.isAI}
              />
            </div>
 
            {/* MOVE HISTORY */}
            <div className="move-history-section">
              <h3 className="section-title">Moves</h3>
              <MoveHistory moves={gameState.moves || []} />
            </div>
 
            {/* GAME CONTROLS */}
            {gameState.status === "ongoing" && (
              <div className="game-controls">
                <button
                  className="btn btn-resign"
                  onClick={handleResign}
                  disabled={gameState.aiThinking}
                  title="Resign from the game"
                >
                  🏳️ Resign
                </button>
                <button
                  className="btn btn-draw"
                  onClick={handleOfferDraw}
                  disabled={gameState.aiThinking}
                  title={
                    gameState.isAI
                      ? "Offer draw (AI will auto-accept)"
                      : "Offer draw"
                  }
                >
                  🤝 Offer Draw
                </button>
              </div>
            )}
 
            {/* LEAVE BUTTON */}
            <button className="btn btn-leave" onClick={handleLeave}>
              👋 Leave Game
            </button>
          </div>
        </div>
      </div>
 
      {/* PAWN PROMOTION DIALOG */}
      {promotionData && (
        <div className="modal-overlay">
          <div className="promotion-dialog">
            <h4>Pawn Promotion</h4>
            <p>Choose a piece to promote to:</p>
            <div className="promotion-options">
              <button
                className="promotion-btn queen"
                onClick={() => handleCompletePromotion("Q")}
                title="Queen"
              >
                ♕ Queen
              </button>
              <button
                className="promotion-btn rook"
                onClick={() => handleCompletePromotion("R")}
                title="Rook"
              >
                ♖ Rook
              </button>
              <button
                className="promotion-btn bishop"
                onClick={() => handleCompletePromotion("B")}
                title="Bishop"
              >
                ♗ Bishop
              </button>
              <button
                className="promotion-btn knight"
                onClick={() => handleCompletePromotion("N")}
                title="Knight"
              >
                ♘ Knight
              </button>
            </div>
          </div>
        </div>
      )}
 
      {/* DRAW OFFER DIALOG */}
      {drawOffer && (
        <div className="modal-overlay">
          <div className="draw-offer-dialog">
            <h4>Draw Offer</h4>
            <p>{drawOffer.offeredByName} offers a draw</p>
            <div className="dialog-actions">
              <button className="btn btn-accept" onClick={handleAcceptDraw}>
                ✓ Accept
              </button>
              <button className="btn btn-reject" onClick={handleRejectDraw}>
                ✗ Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GamePage;