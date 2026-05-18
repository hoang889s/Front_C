import { useEffect, useState,useRef } from "react";
import { replayApi } from "../services/api/replayApi";
import Board from "../components/Game/Board";
import "../styles/game-replay.css"; // 1. Import file CSS vào đây

const GameReplay = ({ gameId, token }) => {
    const [frames, setFrames] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [gameInfo, setGameInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // replay controls
    const [isPlaying, setIsPlaying] = useState(false);
    const [speed, setSpeed] = useState(1000);

    const intervalRef = useRef(null);

    useEffect(() => {
        const loadReplay = async () => {
            try {
                const data = await replayApi.getReplay(gameId, token);
                setFrames(data.replay || []);
                setGameInfo(data.game);
            } catch (err) {
                console.error(err);
                setError(err.message || "Failed to load replay");
            } finally {
                setLoading(false);
            }
        };
        loadReplay();
    }, [gameId, token]);
    useEffect(() =>{
        if(isPlaying){
            intervalRef.current = setInterval(() => {
                setCurrentIndex((prev) => {
                    if (prev >= frames.length - 1) {
                        setIsPlaying(false);
                        return prev;
                    }
                    return prev + 1;
                });
            },speed);

        }
        return () =>{
            clearInterval(intervalRef.current);
        }
    },[isPlaying, speed, frames.length]);

    if (loading) return <div className="replay-container">Loading replay...</div>;
    if (error) return <div className="replay-container">Error: {error}</div>;
    if (!frames || frames.length === 0) return <div className="replay-container">No replay data available</div>;

    const currentFrame = frames[currentIndex];

    if (!currentFrame) return <div className="replay-container">Error loading frame data</div>;

    const nextMove = () => {
        if (currentIndex < frames.length - 1) {
            setCurrentIndex((prev) => prev + 1);
        }
    };

    const prevMove = () => {
        if (currentIndex > 0) {
            setCurrentIndex((prev) => prev - 1);
        }
    };
    const togglePlay = () =>{
        setIsPlaying((prev) => !prev);
    }
    const downloadPGN =  async () =>{
        try{
            await replayApi.exportPGN(gameId);

        }
        catch(err){
            alert("Failed to download PGN");
        }
    }

    const fen_to_board = (fen) => {
        if (!fen) return null;
        const rows = fen.split(" ")[0].split("/");
        return rows.map((row) => {
            const squares = [];
            for (const char of row) {
                if (isNaN(char)) {
                    squares.push(char);
                } else {
                    for (let i = 0; i < Number(char); i++) {
                        squares.push(".");
                    }
                }
            }
            return squares;
        });
    };

    return (
        <div className="replay-container">
            <h2>
                {gameInfo?.white?.name || "Player 1"} vs{" "}
                {gameInfo?.black?.name || "Player 2"}
            </h2>
            
            {/* 2. Thêm class move-counter để bo góc và tạo dải màu phụ */}
            <div className="move-counter">
                Move {currentIndex} / {frames.length - 1}
            </div>

            <Board
                board={fen_to_board(currentFrame.fen)}
                currentTurn={"white"}
                status={"ongoing"}
                disabled={true}
            />
            {/* slider */}
            <input
                type="range"
                min = "0"
                max = {frames.length - 1}
                value={currentIndex}
                onChange={(e) =>setCurrentIndex(Number(e.target.value))}
                className="replay-slider"            
            />

            <div className="controls">
                {/* 3. Tận dụng hàm prevMove / nextMove và thêm thuộc tính disabled tự động */}
                <button onClick={prevMove} disabled={currentIndex === 0}>
                    Previous
                </button>
                <button onClick={togglePlay}>
                    {isPlaying ? "Pause" : "Play"}
                </button>
                <button onClick={nextMove} disabled={currentIndex === frames.length - 1}>
                    Next
                </button>
                <button onClick={downloadPGN}>
                    Download PGN
                </button>
            </div>
            {/* speed control */}
            <div className="speed-control">
                <label>Speed: </label>
                <select
                    value={speed}
                    onChange={(e) =>setSpeed(Number(e.target.value))}
                >
                    <option value={2000}>0.5x</option>
                    <option value={1000}>1x</option>
                    <option value={500}>2x</option>
                    <option value={250}>4x</option>
                </select>
            </div>
        </div>
    );
};

export default GameReplay;