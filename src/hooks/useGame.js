import { useEffect, useState, useCallback } from "react";
import { socketService } from "../services/socket/socketService";

export const useGame = (token) => {
  const [gameState, setGameState] = useState(() => {
    const cached = socketService.getGameStateCache();
    if (cached) {
      console.log("[useGame] Initializing from cache:", cached);
      return {
        gameId: cached.gameId ?? cached.game_id ?? null,
        roomCode: cached.room_code ?? cached.roomCode ?? null,
        board: cached.board ?? [],
        turn: cached.turn ?? null,
        status: cached.status ?? "ongoing",
        white: cached.white ?? null,
        black: cached.black ?? null,
        fen: cached.fen ?? null,
        lastMove: null,
        check: false,
        checkmate: false,
        stalemate: false,
        gameStatus: cached.game_status ?? "ongoing",
        winner: cached.winner ?? null,
        reason: null,
      };
    }
    return {
      gameId: null,
      roomCode: null,
      board: [],
      turn: null,
      status: "ongoing",
      white: null,
      black: null,
      fen: null,
      lastMove: null,
      check: false,
      checkmate: false,
      stalemate: false,
      gameStatus: "ongoing",
      winner: null,
      reason: null,
    };
  });

  const [connected, setConnected] = useState(false);

  // connect sockets
  useEffect(() => {
    if (!token) {
      console.log("[useGame] No token");
      setConnected(false);
      return;
    }

    const socket = socketService.connect(token);
    if (socket.connected) {
      setConnected(true);
    }
    const handleConnect = () => {
      setConnected(true);
    };
    const handleError = () => {
      setConnected(false);
    };
    socket.on("connect", handleConnect);
    socket.on("connect_error", handleError);
    return () => {
      socket.off("connect", handleConnect);
      socket.off("connect_error", handleError);
    };
  }, [token]);

  useEffect(() => {
    const socket = socketService.getSocket();

    if (!socket?.connected) {
      console.log("[useGame] Socket not ready for listeners");
      return;
    }

    console.log("[useGame] Setting up game listeners");

    // ✅ Game state - Cập nhật để nhận game_status + winner
    const handleGameState = (data) => {
      console.log("[Socket Event] game_state:", data);
      console.log("ROOM CODE FROM SERVER:", data.room_code);
      console.log("GAME STATUS FROM SERVER:", data.status);

      setGameState({
        gameId: data.gameId ?? data.game_id ?? null,
        roomCode: data.room_code ?? data.roomCode ?? null,
        board: data.board ?? [],
        turn: data.turn ?? null,
        status: data.status ?? "ongoing",
        white: data.white ?? null,
        black: data.black ?? null,
        fen: data.fen ?? null,
        lastMove: null,
        check: false,
        checkmate: false,
        stalemate: false,
        gameStatus: data.game_status ?? data.status ?? "ongoing",
        winner: data.winner ?? null,
        reason: null,
      });
    };

    // ✅ Move update - Cập nhật để nhận stalemate + game_status + winner
    const handleMove = (data) => {
      console.log("[Socket Event] move:", data);

      console.log("📋 OLD board:");
      console.log("  - Row 6 (rank 2):", gameState.board[6]);

      console.log("📋 NEW board:");
      console.log("  - Row 6 (rank 2):", data.board[6]);

      console.log("📊 FEN:");
      console.log("  - OLD:", gameState.fen);
      console.log("  - NEW:", data.fen);

      // ✅ Kiểm tra game end
      if (data.checkmate || data.stalemate) {
        console.log("[Socket Event] GAME ENDED!");
        if (data.checkmate) {
          console.log(`  - Checkmate! Winner: ${data.winner}`);
        }
        if (data.stalemate) {
          console.log("  - Stalemate! Draw");
        }
      }

      setGameState((prev) => ({
        ...prev,
        board: data.board,
        turn: data.turn,
        fen: data.fen,
        lastMove: data.move,
        check: data.check ?? false,
        checkmate: data.checkmate ?? false,
        stalemate: data.stalemate ?? false,
        status: data.status ?? prev.status,
        gameStatus: data.game_status ?? prev.gameStatus,
        winner: data.winner ?? null,
        reason: data.reason ?? null,
      }));
      console.log("[Socket Event] gameState updated");
    };

    // ✅ AI move - Cập nhật để nhận stalemate + game_status + winner
    const handleAIMove = (data) => {
      console.log("[Socket Event] ai_move:", data);

      if (data.checkmate || data.stalemate) {
        console.log("[Socket Event] AI GAME ENDED!");
        if (data.checkmate) {
          console.log(`  - Checkmate! Winner: ${data.winner}`);
        }
        if (data.stalemate) {
          console.log("  - Stalemate! Draw");
        }
      }

      setGameState((prev) => ({
        ...prev,
        board: data.board,
        turn: data.turn,
        fen: data.fen,
        lastMove: data.move,
        check: data.check ?? false,
        checkmate: data.checkmate ?? false,
        stalemate: data.stalemate ?? false,
        status: data.status ?? prev.status,
        gameStatus: data.game_status ?? prev.gameStatus,
        winner: data.winner ?? null,
      }));
    };

    // ✅ NEW: Game ended event (resignation / draw agreed)
    const handleGameEnded = (data) => {
      console.log("[Socket Event] game_ended:", data);
      console.log(`  - Reason: ${data.reason}`);
      console.log(`  - Winner: ${data.winner}`);
      if (data.loser) {
        console.log(`  - Loser: ${data.loser}`);
      }

      setGameState((prev) => ({
        ...prev,
        status: data.status ?? prev.status,
        gameStatus: data.status ?? prev.gameStatus,
        winner: data.winner ?? null,
        reason: data.reason ?? null,
      }));
    };

    // ✅ NEW: Draw offered
    const handleDrawOffered = (data) => {
      console.log("[Socket Event] draw_offered:", data);
      console.log(
        `  - Offered by: ${data.offered_by_name} (ID: ${data.offered_by})`
      );

      // Emit event để frontend show dialog
      window.dispatchEvent(
        new CustomEvent("drawOffered", {
          detail: {
            gameId: data.game_id,
            offeredBy: data.offered_by,
            offeredByName: data.offered_by_name,
          },
        })
      );
    };

    // ✅ NEW: Draw rejected
    const handleDrawRejected = (data) => {
      console.log("[Socket Event] draw_rejected:", data);
      console.log(
        `  - Rejected by: ${data.rejected_by_name} (ID: ${data.rejected_by})`
      );

      // Emit event để frontend show notification
      window.dispatchEvent(
        new CustomEvent("drawRejected", {
          detail: {
            gameId: data.game_id,
            rejectedBy: data.rejected_by,
            rejectedByName: data.rejected_by_name,
          },
        })
      );
    };

    // ✅ NEW: Draw offer sent
    const handleDrawOfferSent = (data) => {
      console.log("[Socket Event] draw_offer_sent:", data);
      // Notification: "Đã gửi đề nghị hòa"
      window.dispatchEvent(
        new CustomEvent("drawOfferSent", {
          detail: data,
        })
      );
    };

    const handleError = (err) => {
      console.error("[GAME ERROR]", err);
    };

    // Attach listeners
    socketService.on("game_state", handleGameState);
    socketService.on("move", handleMove);
    socketService.on("ai_move", handleAIMove);
    socketService.on("game_ended", handleGameEnded);
    socketService.on("draw_offered", handleDrawOffered);
    socketService.on("draw_rejected", handleDrawRejected);
    socketService.on("draw_offer_sent", handleDrawOfferSent);
    socketService.on("game_error", handleError);

    // Cleanup
    return () => {
      socketService.off("game_state", handleGameState);
      socketService.off("move", handleMove);
      socketService.off("ai_move", handleAIMove);
      socketService.off("game_ended", handleGameEnded);
      socketService.off("draw_offered", handleDrawOffered);
      socketService.off("draw_rejected", handleDrawRejected);
      socketService.off("draw_offer_sent", handleDrawOfferSent);
      socketService.off("game_error", handleError);
    };
  }, [connected]);

  // Game actions
  const joinGame = useCallback(
    (gameId) => {
      const socket = socketService.getSocket();
      if (!socket?.connected) {
        return;
      }
      socketService.emit("join_game", { gameId });
    },
    [connected]
  );

  const makeMove = useCallback(
    (move) => {
      const socket = socketService.getSocket();

      if (!socket?.connected) {
        console.log("[makeMove] Socket not connected");
        return;
      }

      if (!gameState.gameId) {
        console.log("[makeMove] No game id");
        return;
      }

      let payload = {
        game_id: gameState.gameId,
      };

      if (typeof move === "string") {
        payload.move = move;
      } else if (move.from && move.to) {
        payload.move = {
          from: move.from,
          to: move.to,
          ...(move.promotion && { promotion: move.promotion }),
        };
      } else {
        console.error("[makeMove] Invalid move");
        return;
      }

      socketService.emit("move", payload);
    },
    [gameState.gameId]
  );

  const aiMove = useCallback(() => {
    const socket = socketService.getSocket();
    if (!socket?.connected) {
      return;
    }
    socketService.emit("ai_move", {
      game_id: gameState.gameId,
    });
  }, [gameState.gameId]);

  // ✅ NEW: Resign
  const resign = useCallback(() => {
    const socket = socketService.getSocket();
    if (!socket?.connected) {
      console.warn("[resign] Socket not connected");
      return;
    }
    console.log("[resign] Resigning from game:", gameState.gameId);
    socketService.emit("resign", {
      game_id: gameState.gameId,
    });
  }, [gameState.gameId]);

  // ✅ NEW: Offer draw
  const offerDraw = useCallback(() => {
    const socket = socketService.getSocket();
    if (!socket?.connected) {
      console.warn("[offerDraw] Socket not connected");
      return;
    }
    console.log("[offerDraw] Offering draw in game:", gameState.gameId);
    socketService.emit("offer_draw", {
      game_id: gameState.gameId,
    });
  }, [gameState.gameId]);

  // ✅ NEW: Accept draw
  const acceptDraw = useCallback(() => {
    const socket = socketService.getSocket();
    if (!socket?.connected) {
      console.warn("[acceptDraw] Socket not connected");
      return;
    }
    console.log("[acceptDraw] Accepting draw in game:", gameState.gameId);
    socketService.emit("accept_draw", {
      game_id: gameState.gameId,
    });
  }, [gameState.gameId]);

  // ✅ NEW: Reject draw
  const rejectDraw = useCallback(() => {
    const socket = socketService.getSocket();
    if (!socket?.connected) {
      console.warn("[rejectDraw] Socket not connected");
      return;
    }
    console.log("[rejectDraw] Rejecting draw in game:", gameState.gameId);
    socketService.emit("reject_draw", {
      game_id: gameState.gameId,
    });
  }, [gameState.gameId]);

  const leaveGame = useCallback((gameId) => {
    const socket = socketService.getSocket();
    if (!socket?.connected) {
      return;
    }

    socketService.emit("leave_game", {
      game_id: gameId,
    });

    // Reset state
    socketService.clearGameStateCache();
    setGameState({
      gameId: null,
      roomCode: null,
      board: [],
      turn: null,
      status: "ongoing",
      white: null,
      black: null,
      fen: null,
      lastMove: null,
      check: false,
      checkmate: false,
      stalemate: false,
      gameStatus: "ongoing",
      winner: null,
      reason: null,
    });
  }, []);

  return {
    gameState,
    connected,
    joinGame,
    makeMove,
    aiMove,
    resign,
    offerDraw,
    acceptDraw,
    rejectDraw,
    leaveGame,
  };
};
