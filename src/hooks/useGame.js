import { useEffect, useState, useCallback, useRef } from "react";
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
        isAI: cached.isAI ?? false,  // ← THÊM AI flag
        aiThinking: false,  // ← THÊM state "đang suy nghĩ"
        aiDifficulty: cached.ai_difficulty ?? "medium",
        moves:[],// Thêm moves ở khởi tạo
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
      isAI: false,
      aiThinking: false,
      aiDifficulty: "medium",
      moves:[]// thêm nữa ở đây
    };
  });

  const [connected, setConnected] = useState(false);
  const currentUserIdRef = useRef(null);  // ← Track user ID để biết ai là AI player

  // Connect sockets
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

    // Game state handler
    const handleGameState = (data) => {
      console.log("[Socket Event] game_state:", data);
      
      // Detect AI game mode
      const isAIGame = data.game_id && (data.mode === "ai" || data.is_ai);
      
      setGameState((prev) => ({
        ...prev,
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
        isAI: isAIGame,
        aiThinking: false,
        aiDifficulty: data.ai_difficulty ?? "medium",
        moves:data.moves,// thêm ở dây
      }));

      // ← THÊM: Nếu là AI game và lượt của AI, emit ai_move sau 1s
      if (isAIGame && data.turn) {
        // Xác định xem AI là white hay black
        const userIsWhite = currentUserIdRef.current === data.white;
        const isAITurn = userIsWhite ? data.turn === "black" : data.turn === "white";
        
        if (isAITurn) {
          console.log("[useGame] AI turn detected, calling AI move...");
          setTimeout(() => {
            // Emit AI move event
            socketService.emit("ai_move", {
              game_id: data.gameId || data.game_id,
            });
          }, 500);  // Delay 500ms để có cảm giác AI suy nghĩ
        }
      }
    };

    // Move handler
    const handleMove = (data) => {
      console.log("[Socket Event] move:", data);

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
        aiThinking: false,
        aiDifficulty: data.ai_difficulty ?? prev.aiDifficulty,
        moves: [...(prev.moves || []), data.move],// thêm ở đây
      }));

      // ← THÊM: Kiểm tra xem có phải lượt AI không
      if (gameState.isAI && data.turn && !data.checkmate && !data.stalemate) {
        const userIsWhite = currentUserIdRef.current === gameState.white;
        const isAITurn = userIsWhite ? data.turn === "black" : data.turn === "white";
        
        if (isAITurn) {
          console.log("[useGame] AI turn after move, calling AI move...");
          setGameState((prev) => ({ ...prev, aiThinking: true }));
          
          setTimeout(() => {
            socketService.emit("ai_move", {
              game_id: gameState.gameId,
            });
          }, 500);
        }
      }
    };

    // AI Move handler
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
        aiThinking: false,
        moves: [...(prev.moves || []), data.move],// thêm ở đây
      }));
    };

    // Game ended handler
    const handleGameEnded = (data) => {
      console.log("[Socket Event] game_ended:", data);

      setGameState((prev) => ({
        ...prev,
        status: data.status ?? prev.status,
        gameStatus: data.status ?? prev.gameStatus,
        winner: data.winner ?? null,
        reason: data.reason ?? null,
        aiThinking: false,
      }));
    };

    // Draw offered handler
    const handleDrawOffered = (data) => {
      console.log("[Socket Event] draw_offered:", data);
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

    // Draw rejected handler
    const handleDrawRejected = (data) => {
      console.log("[Socket Event] draw_rejected:", data);
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

    // Error handler
    const handleError = (err) => {
      console.error("[GAME ERROR]", err);
      setGameState((prev) => ({ ...prev, aiThinking: false }));
    };

    // Attach listeners
    socketService.on("game_state", handleGameState);
    socketService.on("move", handleMove);
    socketService.on("ai_move", handleAIMove);
    socketService.on("game_ended", handleGameEnded);
    socketService.on("draw_offered", handleDrawOffered);
    socketService.on("draw_rejected", handleDrawRejected);
    socketService.on("game_error", handleError);

    // Cleanup
    return () => {
      socketService.off("game_state", handleGameState);
      socketService.off("move", handleMove);
      socketService.off("ai_move", handleAIMove);
      socketService.off("game_ended", handleGameEnded);
      socketService.off("draw_offered", handleDrawOffered);
      socketService.off("draw_rejected", handleDrawRejected);
      socketService.off("game_error", handleError);
    };
  }, [connected, gameState.isAI, gameState.white, gameState.gameId]);

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

      // Không cho phép move nếu AI đang suy nghĩ
      if (gameState.aiThinking) {
        console.log("[makeMove] AI is thinking...");
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
    [gameState.gameId, gameState.aiThinking]
  );

  const aiMove = useCallback(() => {
    const socket = socketService.getSocket();
    if (!socket?.connected) {
      return;
    }
    console.log("[aiMove] Requesting AI move...");
    setGameState((prev) => ({ ...prev, aiThinking: true }));
    socketService.emit("ai_move", {
      game_id: gameState.gameId,
    });
  }, [gameState.gameId]);

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
      isAI: false,
      aiThinking: false,
      aiDifficulty: "medium",
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
    setCurrentUserId: (userId) => {
      currentUserIdRef.current = userId;
    },
  };
};