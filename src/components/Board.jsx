import Cell from "./Cell";
const Board = ({board})=>{
    const flatBoard = board.flat();
    return (
    <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(8, 60px)",
        border: "2px solid #555",
        width: "fit-content",
    }}>
        {flatBoard.map((cell,index)=>(
            <Cell key={index} value={cell} index={index}/>
        ))}
    </div>);
}
export default Board;