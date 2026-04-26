import React from "react";
import "../../styles/board.css";

const PIECE_SYMBOLS = {
    white: {
        pawn: "♙",
        rook: "♖",
        knight: "♘",
        bishop: "♗",
        queen: "♕",
        king: "♔",
    },
    black: {
        pawn: "♟",
        rook: "♜",
        knight: "♞",
        bishop: "♝",
        queen: "♛",
        king: "♚",
    },
};
const PIECE_MAP = {
    p: "pawn",
    r: "rook",
    n: "knight",
    b: "bishop",
    q: "queen",
    k: "king",
}
const Piece = ({piece})=>{
    if (!piece||piece === ".") {
        return null;
    }
    let type,color;
    if (typeof piece === "string") {
        type = PIECE_MAP[piece.toLowerCase()];
        color = piece === piece.toUpperCase() ? "white" : "black";
    }
    else if (typeof piece === "object") {
        ({ type, color } = piece);
    }
    const symbol = PIECE_SYMBOLS[color]?.[type];
    if(!symbol){
        console.warn("Unknown piece:", piece);
        return null;
    }
   
    return (
        <div className={`piece ${color}`}>
            {symbol}
        </div>
    );

};
export default Piece;