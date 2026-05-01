import { useEffect, useState, useCallback } from "react";
import { socketService } from "../services/socket/socketService";

export const useGame = (token) => {
  const [gameState, setGameState] = useState({
    gameId: null,
    roomCode:null,
    board: [],
    turn: null,
    status: "waiting",
    white:null,
    black:null,
    fen:null,
    lastMove:null,
    checkmate:false,
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
    if(socket.connected){
      setConnected(true);
    }
    const handleConnect = () =>{
      setConnected(true);
    };
    const handleError = () =>{
      setConnected(false);
    };
    socket.on("connect", handleConnect);
    socket.on("connect_error", handleError);
    return () =>{
      socket.off("connect",handleConnect);
      socket.off("connect_error", handleError);
    }
  }, [token]);

  
  useEffect(() => {
    const socket = socketService.getSocket();

    if (!socket?.connected) {
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
    // game state
    const handleGameState = (data) => {
      console.log("[Socket Event] game_state:", data);
      console.log("ROOM CODE FROM SERVER:", data.room_code);


      setGameState({
        gameId: data.gameId ?? data.game_id ?? null,
        roomCode: data.room_code ?? data.roomCode ?? null,
        board: data.board ?? [],
        turn: data.turn ?? null,
        status: data.status ?? "waiting",
        white: data.white ?? null,
        black: data.black ?? null,
        fen: data.fen ?? null,
        lastMove: null,
        check: false,
        checkmate: false,
      });
      
    };

    // Move update
    const handleMove = (data) => {
      console.log("[Socket Event] move:", data);
      setGameState((prev) => ({
        ...prev,
        board: data.board,
        turn:data.turn,
        fen:data.fen,
        lastMove:data.move,
        check:data.check,
        checkmate:data.checkmate,
        status: data.status ?? prev.status,
      }));
    };
    // Ai move
    const handleAIMove = (data)=>{
      setGameState((prev) => ({
        ...prev,
        board: data.board,
        turn: data.turn,
        fen: data.fen,
        lastMove: data.move,
      }));
    };
    const handleError = (err)=>{
      console.error("[GAME ERROR]", err);
    }

    // Attach listeners
    socketService.on("game_state", handleGameState);
    socketService.on("move", handleMove);
    socketService.on("ai_move",handleAIMove);
    socketService.on("game_error", handleError);

    // Cleanup: Remove listeners when component unmounts or socket disconnects
    return () => {
      socketService.off("game_state", handleGameState);
      socketService.off("move", handleMove);
      socketService.off("ai_move", handleAIMove);
      socketService.off("game_error", handleError);
    };
  }, [connected]); // Dependency: chỉ khi connected status thay đổi

  // Game actions
  const joinGame = useCallback((gameId) => {
    const socket = socketService.getSocket();
    if(!socket?.connected){
      return;
    }
    socketService.emit("join_game",{gameId});
  }, [connected]);

  const makeMove = useCallback(
    (move) => {
      const socket = socketService.getSocket();
      if (!socket?.connected) {
        return;
      }

      
      socketService.emit("move", {
        game_id: gameState.gameId,
        move: move,
      });
    },
    [gameState.gameId]
  );
  const aiMove = useCallback(()=>{
    const socket = socketService.getSocket()
    if (!socket?.connected){
      return;
    }
    socketService.emit("ai_move",{
      game_id: gameState.gameId,
    });
  },[gameState.gameId]);


  const leaveGame = useCallback((gameId) => {
    const socket = socketService.getSocket();
    if (!socket?.connected) {
      return;
    }

    socketService.emit("leave_game",{
      game_id:gameId,
    });

    // Reset state
    setGameState({
      gameId: null,
      roomCode:null,
      board: [],
      turn: null,
      status:"waiting",
      white:null,
      black:null,
      fen:null,
      lastMove:null,
      check:false,
      checkmate:false,
    });
  }, []);

  return {
    gameState,
    connected,
    joinGame,
    makeMove,
    aiMove,
    leaveGame,
  };
};
