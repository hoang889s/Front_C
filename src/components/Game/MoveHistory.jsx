import React from "react";
import { normallizeMove } from "../../utils/convertMove";
import "../../styles/move_history.css";

const MoveHistory = ({ moves }) => {
    const hasMoves = moves && moves.length > 0;

    return (
        <div className="move-history">
            <div className="move-history-header">
                <h3>Lịch sử nước đi</h3>
            </div>

            {hasMoves ? (
                <ul className="move-list">
                    {moves.map((move, index) => {
                        const normalized = normallizeMove(move);

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
            ) : (
                <div className="move-history-empty">
                    Chưa có nước đi nào
                </div>
            )}
        </div>
    );
};

export default MoveHistory;