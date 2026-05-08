import { useState } from "react";
import Piece from "./Piece";
import "../../styles/board.css";

const Board = ({ board, currentTurn, status, onMove,disabled }) => {
  const [selected, setSelected] = useState(null);
  console.log("🔵 Board component received:");
  console.log("  - status:", status);
  console.log("  - currentTurn:", currentTurn);
  console.log("  - board length:", board?.length);
  console.log("  - disabled:", disabled);

  const handleClick = (row, col) => {
    if (disabled) {
      console.log("❌ Board is disabled, ignoring click");
      return;
    }
    console.log("CLICK at:", row, col);
    console.log("Current status value:", status);
    console.log("status !== 'ongoing'?", status !== "ongoing");

    // ✅ FIX: Match backend status values
    // Backend: "ongoing", "win", "loss", "draw"
    // ❌ OLD: Checked for "playing"
    // ✅ NEW: Check for "ongoing"
    if (status !== "ongoing") {
      console.log("NOT PLAYING - Status:", status);
      return;
    }

    const cell = board[row][col];

    // Không có quân
    if (!selected) {
      if (!cell) return;

      // check đúng lượt
      if (currentTurn === "white" && cell !== cell.toUpperCase()) return;
      if (currentTurn === "black" && cell !== cell.toLowerCase()) return;

      console.log("SELECT", row, col);
      setSelected({ row, col });
      return;
    }

    // click lại ô cũ → bỏ chọn
    if (selected.row === row && selected.col === col) {
      setSelected(null);
      return;
    }

    const move = {
      from: selected,
      to: { row, col },
    };

    console.log("MOVE:", move);

    if (onMove) {
      onMove(move);
    } else {
      console.error("onMove not defined");
    }

    setSelected(null);
  };

  const renderSquare = (cell, row, col) => {
    const isSelected = selected && selected.row === row && selected.col === col;

    return (
      <div
        key={`${row}-${col}`}
        className={`square ${(row + col) % 2 === 0 ? "light" : "dark"} ${
          isSelected ? "selected" : ""

        }
        ${disabled ? "disabled" : ""} 
        `}
        onClick={() => handleClick(row, col)}
      >
        {cell !== "." && <Piece piece={cell} />}
      </div>
    );
  };

  if (!board || board.length === 0) {
    return <div>Loading board...</div>;
  }

  return (
    <div className="board-container">
      <div className="status">
        Turn: <strong>{currentTurn}</strong>
      </div>
 
      {/* ✅ FIX: Dùng backtick ` chứ không phải dấu ngoặc kép " */}
      <div className={`board ${disabled ? "disabled" : ""}`}>
        {board.map((rowArr, row) =>
          rowArr.map((cell, col) => renderSquare(cell, row, col))
        )}
      </div>
    </div>
  );
};

export default Board;
