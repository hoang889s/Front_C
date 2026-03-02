const CELL_SIZE = 60;
/**
 * @param {string|null} value      - Ký tự quân cờ hoặc null/""
 * @param {number}      row        - Hàng (0–7)
 * @param {number}      col        - Cột (0–7)
 * @param {boolean}     isSelected - Ô đang được chọn
 * @param {function}    onClick    - Callback khi click
 */
const Cell =({value,row,col,isSelected,onClick})=>{

    const isLight = (row+col)%2 === 0;
     const bgColor = isSelected
    ? "#f6f669"                              // Ô đang chọn → vàng
    : isLight
    ? "#f0d9b5"                              // Ô sáng
    : "#b58863";                             // Ô tối
    return (
        <div
            onClick={onClick}
            style={{
                width: `${CELL_SIZE}px`,
                height: `${CELL_SIZE}px`,
                border: isSelected ? "2px solid #baca2b" : "1px solid #999",
                boxSizing: "border-box",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "28px",
                backgroundColor: bgColor,
                cursor: value ? "pointer" : "default",
                userSelect: "none",
                transition: "background-color 0.15s",
        }}
        >
            {value}
        </div>
    );
}
export default Cell;