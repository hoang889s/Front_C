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

const GamePage = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

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
  } = useGame(token);

  const joinedGameIdRef = useRef(null);

  //   State cho draw dialog
  const [drawOffer, setDrawOffer] = useState(null);

  //  State cho pawn promotion
  const [promotionData, setPromotionData] = useState(null);



  //  Listen cho custom events từ socket
  useEffect(() => {
    const handleDrawOffered = (e) => {
      const { gameId: offeredGameId, offeredBy, offeredByName } = e.detail;
      console.log("[GamePage] Draw offered:", e.detail);

      // Chỉ show dialog nếu draw được offer cho game này
      if (offeredGameId === gameState.gameId) {
        setDrawOffer({
          offeredBy,
          offeredByName,
        });
      }
    };

    const handleDrawOfferSent = (e) => {
      console.log("[GamePage] Draw offer sent:", e.detail);
      // Có thể show notification: "Đã gửi đề nghị hòa"
    };

    const handleDrawRejected = (e) => {
      const { rejectedByName } = e.detail;
      console.log("[GamePage] Draw rejected by:", rejectedByName);
      // Clear dialog
      setDrawOffer(null);
      // Show notification: "{rejectedByName} đã từ chối lời đề nghị hòa"
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

  // join game khi vào page
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
  console.log("gameState.status:", gameState.status);
  console.log("connected:", connected);

  // chưa connect
  if (!connected) {
    return <Loading />;
  }
  // chưa có game
  if (!gameState?.gameId) {
    return <Loading />;
  }

  const handleMove = (move) => {
    // Kiểm tra xem có phải pawn promotion không
    console.log("MOVE:", move);
    console.log("BOARD:", gameState.board);
    if (isPromotionMove(move, gameState.board)) {
      console.log("PROMOTION DETECTED ");
      // Lưu move chưa hoàn tất, show dialog chọn quân
      setPromotionData({
        move,
        color: gameState.turn,
      });
      return;

    }
    // Không phải promotion, send move ngay
    makeMove(move);
  };
  // Complete promotion - gửi move với promotion piece
  const handleCompletePromotion = (promotionPiece) => {
    if (!promotionData){
      return;
    }
    console.log("[GamePage] Completing promotion with:", promotionPiece);
    const moveWithPromotion = createPromotionMove(promotionData.move, promotionPiece);
    console.log("[GamePage] Sending move:", moveWithPromotion);

    makeMove(moveWithPromotion);
    setPromotionData(null);
  };



  //  Handle resign
  const handleResign = () => {
    const confirmed = window.confirm("Bạn chắc chắn muốn đầu hàng?");
    if (!confirmed) return;

    console.log("[GamePage] Resigning...");
    resign();
  };

  //  Handle offer draw
  const handleOfferDraw = () => {
    console.log("[GamePage] Offering draw...");
    offerDraw();
  };

  //  Handle accept draw
  const handleAcceptDraw = () => {
    console.log("[GamePage] Accepting draw...");
    acceptDraw();
    setDrawOffer(null);
  };

  //  Handle reject draw
  const handleRejectDraw = () => {
    console.log("[GamePage] Rejecting draw...");
    rejectDraw();
    setDrawOffer(null);
  };

  const handleLeave = () => {
    if (gameId) {
      leaveGame(parseInt(gameId));
    }
    navigate("/");
  };

  console.log("RENDER GAME PAGE");
  console.log("gameState:", gameState);
  console.log("connected:", connected);

  return (
    <div className="game-page">
      <div className="game-container">
        {/* LEFT: BOARD */}
        <div className="game-board">
          <Board
            board={gameState.board}
            currentTurn={gameState.turn}
            status={gameState.status}
            onMove={handleMove}
          />
        </div>

        {/* RIGHT: INFO PANEL */}
        <div className="game-sidebar">
          {gameState.roomCode && (
            <div className="room-box">
              <p>Room Code:</p>
              <h3>{gameState.roomCode}</h3>
              <button
                onClick={() => navigator.clipboard.writeText(gameState.roomCode)}
              >
                Copy
              </button>
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
          />

          <MoveHistory moves={gameState.moves || []} />

          {/*  Game control buttons */}
          {gameState.status === "ongoing" && (
            <div className="game-controls">
              <button
                className="btn-resign"
                onClick={handleResign}
                title="Đầu hàng"
              >
                🏳️ Đầu hàng
              </button>
              <button
                className="btn-draw"
                onClick={handleOfferDraw}
                title="Đề nghị hòa"
              >
                🤝 Đề nghị hòa
              </button>
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


          {/*  Draw offer dialog */}
          {drawOffer && (
            <div className="draw-offer-dialog">
              <h4>Đề nghị hòa</h4>
              <p>{drawOffer.offeredByName} đề nghị hòa cả trò chơi</p>
              <div className="dialog-actions">
                <button
                  className="btn-accept"
                  onClick={handleAcceptDraw}
                >
                  ✓ Chấp nhận
                </button>
                <button
                  className="btn-reject"
                  onClick={handleRejectDraw}
                >
                  ✗ Từ chối
                </button>
              </div>
            </div>
          )}

          <button
            className="leave-btn"
            onClick={handleLeave}
          >
            Thoát Game
          </button>
        </div>
      </div>
    </div>
  );
};

export default GamePage;