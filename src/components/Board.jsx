import Cell from "./Cell";
/**
 * @param {string[][]} board          - Ma trận 8x8
 * @param {{row,col}|null} selected   - Ô đang chọn
 * @param {function} onCellClick      - (row, col) => void
 */
const Board = ({board,selected,onCellClick})=>{
    return (
    <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(8, 60px)",
        border: "2px solid #555",
        width: "fit-content",
        boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
    }}>
        {board.map((row,r)=>
        row.map((cell,c)=>(
            <Cell
                key = {`${r}-${c}`}
                value = {cell}
                row = {r}
                col = {c}
                isSelected = {selected?.row === r && selected?.col === c}
                onClick={() => onCellClick(r, c)}
            />
        ))
    )}
    </div>
    );
}
export default Board;