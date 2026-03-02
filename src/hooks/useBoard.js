import {useState,useEffect,useCallback} from "react";
import {fetchBoard,sendMove} from "../api/boardApi";
// Quân trắng : P N B R Q K 
const WHITE_PIECES = new Set(["P","N","B","R","Q","K"]);
// Quân đen : p n b r q k
const BLACK_PIECES = new Set(["p","n","b","r","q","k"]);
const piecColor = (piece)=>{
    if (WHITE_PIECES.has(piece)){
        return "white";
    }
    if (BLACK_PIECES.has(piece)){
        return "black";
    }
}
const useBoard = () =>{
    const [board,setBoard] = useState([]);
    const [loading,setLoading] = useState(true);
    const [error,setError] = useState(null);
    // ô được chọn row,col
    const [selected,setSelected] = useState(null);
    // lựa chọn hiện tại "white|black"
    const [turn,setTurn]=useState("white");
    // trạng thái sau khi gửi nước đi
    const [moveStatus,setMoveStatus] = useState(null);
    useEffect(()=>{
        setLoading(true)
        fetchBoard()
            .then((data)=>setBoard(data))
            .catch((err)=>setError(err.message))
            .finally(()=>setLoading(false));
    },[]);
    return {board,loading,error};
    // lưu một function click để re-render
    const handleCellClick = useCallback(
        async (row , col)=>{
            // quy trình cụ thể là khi chưa chọn -> chọn ô -> + bỏ chọn ô đó hoặc chọn ô khác
            // nếu là move status thì trả về (đang chờ ai suy nghĩ) không cho nhấn chuột
            if (moveStatus ==="thinking"){
                return;
            }
            // vị trị quân cờ hiện tại
            const clickedPiece = board[row]?.[col];
            // nếu chọn đúng lượt (turn) cùng màu thì lấy ví trí hiện tại
            if (!selected){
                if(piecColor(clickedPiece)===turn){
                    setSelected({row,col});
                }
                return;
            }
            // nếu đã chọn rồi mà muốn bỏ chọn thì hãy bỏ chọn bỏ chọn sau khi chọn
            if (selected.row === row&&selected.col===col){
                setSelected(null);
                return;
            }
            // nếu chọn khác màu thì chọn ô đó
            if(piecColor(clickedPiece)===turn){
                setSelected({row,col});
                return ;
            }
            // gửi lên server
            const from = selected;
            const to= {row,col};
            setSelected(null);
            setMoveStatus("thinking");
            try{
                const result = await sendMove(from,to);
                if (result.board){
                    setBoard(result.board);
                }
                if(result.status ==="invalid"){
                    setMoveStatus("invalid");
                    setTimeout(() => setMoveStatus(null), 1500);
                    return;
                }
                 // Nước hợp lệ → đổi lượt (hoặc dùng turn từ server nếu có)
                setTurn((prev) => (prev === "white" ? "black" : "white"));
                setMoveStatus(result.status ?? "ok");
                setTimeout(() => setMoveStatus(null), 1500);
            }
            catch(err){
                setError(err.message);
                setMoveStatus(null);
            }
        },
        [board, selected, turn, moveStatus]
    )
    return {board,loading,error,selected,turn,moveStatus,handleCellClick};
};
export default useBoard;