import { useState } from "react";
import Piece from "./Piece";
import "../../styles/board.css";

const Board = ({ board, currentTurn, status, onMove }) => {
  const [selected, setSelected] = useState(null);
  console.log("🔵 Board component received:");
  console.log("  - status:", status);
  console.log("  - currentTurn:", currentTurn);
  console.log("  - board length:", board?.length);
  /*const handleClick = (row, col) => {
        if (status !== "playing") return;

        if (!selected) {
            console.log("SELECTING");
            if (!board[row][col]||board[row][col] === "."){
                return;
            }
            setSelected({ row, col });
            return;
        }

        const move = {
            from: selected,
            to: { row, col },
        };
        console.log("di chuyển")
        onMove(move);
        setSelected(null);
    };*/
  const handleClick = (row, col) => {
    console.log("CLICK at:", row, col);
    console.log("Current status value:", status);
    console.log("status !== 'playing'?", status !== "playing");

    if (status !== "ongoing") {
      console.log("NOT PLAYING");
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
    //console.log(row, col, cell, isSelected);

    return (
      <div
        key={`${row}-${col}`}
        className={`square ${(row + col) % 2 === 0 ? "light" : "dark"} ${
          isSelected ? "selected" : ""
        }`}
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

      <div className="board">
        {board.map((rowArr, row) =>
          rowArr.map((cell, col) => renderSquare(cell, row, col))
        )}
      </div>
    </div>
  );
};

export default Board;
