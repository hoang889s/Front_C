import { useEffect, useState, useCallback } from "react";
import { socketService } from "../services/socket/socketService";

export const useGame = (token) => {
  const [gameState, setGameState] = useState({
    gameId: null,
    board: [],
    currentTurn: null,
    status: "waiting",
    players: [],
    winner: null,
    moves: [],
  });
  const [connected, setConnected] = useState(false);

  
  useEffect(() => {
    if (!token) {
      console.log("[useGame] No token");
      setConnected(false);
      return;
    }

    console.log("[useGame] Connecting socket with token");
    const socket = socketService.connect(token);

    if (socket.connected) {
      console.log("[useGame] Socket already connected!");
      setConnected(true);
    }

    const handleConnect = () => {
      console.log("[useGame] Socket connected!");
      setConnected(true);
    };

    const handleConnectError = (error) => {
      console.error("[useGame] Socket error:", error);
      setConnected(false);
    };

    socket.on("connect", handleConnect);
    socket.on("connect_error", handleConnectError);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("connect_error", handleConnectError);
    };
  }, [token]);

  
  useEffect(() => {
    const socket = socketService.getSocket();

    if (!socket || !socket.connected) {
      console.log("[useGame] Socket not ready for listeners");
      return;
    }

    console.log("[useGame] Setting up game listeners");

    // Game state initialization
    /*const handleGameState = (data) => {
            console.log("[Socket Event] game_state:", data);
            setGameState((prev) => ({
                ...prev,
                ...data,
            }));
        };*/
    const handleGameState = (data) => {
      console.log("[Socket Event] game_state:", data);

      setGameState((prev) => ({
        ...prev,
        gameId: data.gameId,
        board: data.board,
        currentTurn: data.currentTurn,
        status: data.status,
        players: data.players,
        winner: data.winner,
        moves: data.moves || [],
      }));
    };

    // Move update
    const handleMove = (data) => {
      console.log("[Socket Event] move:", data);
      setGameState((prev) => ({
        ...prev,
        board: data.board,
        currentTurn: data.currentTurn,
        moves: [...(prev.moves || []), data],
      }));
    };

    // Game start
    const handleGameStart = (data) => {
      console.log("[Socket Event] game_start:", data);
      setGameState((prev) => ({
        ...prev,
        status: "playing",
        ...data,
      }));
    };

    // Game end
    const handleGameEnd = (data) => {
      console.log("[Socket Event] game_end:", data);
      setGameState((prev) => ({
        ...prev,
        status: "finished",
        winner: data.winner,
      }));
    };

    // Game error
    const handleGameError = (error) => {
      console.error("[Socket Event] game_error:", error);
    };

    // Attach listeners
    socketService.on("game_state", handleGameState);
    socketService.on("move", handleMove);
    socketService.on("game_start", handleGameStart);
    socketService.on("game_end", handleGameEnd);
    socketService.on("game_error", handleGameError);

    // Cleanup: Remove listeners when component unmounts or socket disconnects
    return () => {
      console.log("[useGame] Cleaning up listeners");
      socketService.off("game_state", handleGameState);
      socketService.off("move", handleMove);
      socketService.off("game_start", handleGameStart);
      socketService.off("game_end", handleGameEnd);
      socketService.off("game_error", handleGameError);
    };
  }, [connected]); // Dependency: chỉ khi connected status thay đổi

  // Game actions
  const joinGame = useCallback((gameId) => {
    if (!gameId) {
      console.error("[useGame] joinGame: gameId is required");
      return;
    }

    const socket = socketService.getSocket();
    if (!socket?.connected) {
      console.error("[useGame] joinGame: Socket not connected");
      return;
    }

    console.log("[useGame] Joining game:", gameId);
    // ✅ Backend expects: { gameId }
    socketService.emit("join_game", { gameId });
  }, []);

  const makeMove = useCallback(
    (move) => {
      const socket = socketService.getSocket();
      if (!socket?.connected) {
        console.error("[useGame] makeMove: Socket not connected");
        return;
      }

      console.log("[useGame] Making move:", move);
      
      socketService.emit("move", {
        game_id: gameState.gameId,
        move: move,
      });
    },
    [gameState.gameId]
  );

  const leaveGame = useCallback(() => {
    const socket = socketService.getSocket();
    if (!socket?.connected) {
      console.warn("[useGame] leaveGame: Socket not connected");
      return;
    }

    console.log("[useGame] Leaving game");
    socketService.emit("leave_game");

    // Reset state
    setGameState({
      gameId: null,
      board: [],
      currentTurn: null,
      status: "waiting",
      players: [],
      winner: null,
      moves: [],
    });
  }, []);

  return {
    gameState,
    connected,
    joinGame,
    makeMove,
    leaveGame,
  };
};
