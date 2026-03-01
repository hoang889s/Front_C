const CELL_SIZE = 60;
const Cell =({value,index})=>{
    const row = Math.floor(index/8);
    const col = index%8;
    const isLight = (row+col)%2 === 0;
    return (
        <div
            style={{
                width: `${CELL_SIZE}px`,
                height: `${CELL_SIZE}px`,
                border: "1px solid #999",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "28px",
                backgroundColor: isLight ? "#f0d9b5" : "#b58863",
                cursor: value ? "pointer" : "default",
                userSelect: "none",
        }}
        >
            {value}
        </div>
    );
}
export default Cell;