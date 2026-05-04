import { useCallback, useEffect , useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGame } from "../hooks/useGame";
//import { useAuthLogic } from "../hooks/useAuth";
import { useAuth } from "../context/AuthContext";
// Components
import Board from "../components/Game/Board";
import MoveHistory from "../components/Game/MoveHistory";
import GameStatus from "../components/Game/GameStatus";
import Loading from "../components/Common/Loading";
const GamePage = () =>{
    const { gameId } = useParams();
    const navigate = useNavigate();
    const { token } = useAuth();
    const {
        gameState,
        connected,
        joinGame,
        makeMove,
        leaveGame,  
    } = useGame(token);
    const joinedGameIdRef = useRef(null);
    // join game khi vào page
    useEffect(() => {
        if (!gameId|| !connected) {
            console.warn("[GAME_PAGE] No gameId in URL");
            return;
        }
        const id = parseInt(gameId);
        if (joinedGameIdRef.current === id){
            return;
        }
        console.log("[JOIN]", id);
        joinGame(id);
        joinedGameIdRef.current = id;
        return () =>{
            if (joinedGameIdRef.current === id) {
                console.log("[GAME_PAGE] Leaving game:", id);
                leaveGame(id);
                joinedGameIdRef.current = null;
            }
        }

    },[gameId,connected,joinGame, leaveGame]);
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
        makeMove(move);
        
    };
    const handleLeave = () => {
        if(gameId){
        leaveGame(parseInt(gameId));
        }
        navigate("/");
    };
    console.log("RENDER GAME PAGE");
    console.log("gameState:", gameState);
    console.log("connected:", connected);
    console.log("GamePage render");
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
                            >Copy
                            </button>
                        </div>
                    )}
                    <GameStatus
                        status={gameState.status}
                        currentTurn={gameState.turn}
                        players={{
                            white:gameState.white,
                            black:gameState.black,
                        }}
                        winner={gameState.winner}
                    />
                    <MoveHistory moves={gameState.moves || []} />
                    <button
                        className="leave-btn"
                        onClick={handleLeave}
                    >
                        Thoát Game
                    </button>
                </div>

            </div>


        </div>
    )
}
export default GamePage;