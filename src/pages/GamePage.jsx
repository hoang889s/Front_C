import { useCallback, useEffect } from "react";
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
    // join game khi vào page
    useEffect(() => {
        if (!gameId) {
            console.warn("[GAME_PAGE] No gameId in URL");
            return;
        }
        if (!connected) {
            console.log("[GAME_PAGE] Waiting for socket connection...");
            return;
        }
        joinGame(gameId);
        return () =>{
            leaveGame();
        }

    },[gameId,connected]);
    // chưa connect
    if (!connected) {
        return <Loading />;
    }
    // chưa có game
    if (!gameState.gameId) {
        return <Loading />;
    }
    const handleMove = (move) => {
        makeMove(move);
    };
    const handleLeave = () => {
        leaveGame();
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
                        currentTurn={gameState.currentTurn}
                        status={gameState.status}
                        onMove={handleMove}
                    />
                    
                </div>
                {/* RIGHT: INFO PANEL */}
                <div className="game-sidebar">
                    <GameStatus
                        status={gameState.status}
                        currentTurn={gameState.currentTurn}
                        players={gameState.players}
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