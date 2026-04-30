import React from "react";
import "../../styles/board.css";
import { normallizeMove } from "../../utils/convertMove";
const MoveHistory =({moves})=>{
    console.log("từ file MoveHistory.jsx",moves);
    if (!moves||moves.length === 0){
        return(
            <div className="move-history">
                <h3>Lịch sử nước đi</h3>
                <p>Chưa có nước đi nào</p>
            </div>
        );

    }
    return (
        <div className="move-history">
            <h3>Lịch sử nước đi</h3>
            <ul className="move-list">
                {moves.map((move,index)=>{
                    //nếu backend trả string: "e2e4"
                    //hoặc object: { from: "e2", to: "e4", piece: "pawn" }
                    const normalized = normallizeMove(move);
                    console.log("normalized row:", normalized.from, normalized.to);
                    return (
                        <li key={index} className="move-item">
                            <span className="move-index">
                                {Math.floor(index / 2) + 1}.
                            </span>
                            <span className="move-text">
                                {normalized.from} → {normalized.to}
                            </span>

                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
export default MoveHistory;