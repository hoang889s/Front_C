import {useState,useEffect,useCallback} from "react";
import {fetchBoard, sendMove, fetchLegalMoves, resetGame as apiResetGame } from "../api/boardApi";
// Quân trắng : P N B R Q K 
const WHITE_PIECES = new Set(["P","N","B","R","Q","K"]);
// Quân đen : p n b r q k
const BLACK_PIECES = new Set(["p","n","b","r","q","k"]);
const DEFAULT_GAME_STATUS = { state: "ongoing" };
const pieceColor = (piece)=>{
    if (WHITE_PIECES.has(piece)){
        return "white";
    }
    if (BLACK_PIECES.has(piece)){
        return "black";
    }
    return null;
}
/**
 * Kiểm tra nước đi có phải phong quân không.
 * Tốt trắng (P) đến hàng 0 hoặc tốt đen (p) đến hàng 7.
 * Kiểm tra xem hàm đã đến cuối hàng hay chưa
 */
const isPromotionMove = (board,from,to)=>{
    const piece = board[from.row]?.[from.col];
    if (piece === "P" && to.row === 0){
        return true;
    }
    if (piece === "p" && to.row === 7){
        return true;
    }
    return false;
}
const useBoard = ({mode = "pva",roomCode=null,myColor=null,pollInterval = 2000}={}) =>{
    const [board,setBoard] = useState([]);
    const [loading,setLoading] = useState(true);
    const [error,setError] = useState(null);
    // ô được chọn row,col
    const [selected,setSelected] = useState(null);
    // lựa chọn hiện tại "white|black"
    const [turn,setTurn]=useState("white");
    // trạng thái sau khi gửi nước đi
    const [moveStatus,setMoveStatus] = useState(null);
    // trạng thái danh sách quân cờ
    const [legalMoves,setLegalMoves] = useState([]);
    /**
    * game_status từ server:
    *   { state: "ongoing" }
    *   { state: "check",     color: "white"|"black" }
    *   { state: "checkmate", loser: "white"|"black" }
    *   { state: "stalemate" }
    */
    const [gameStatus,setGameStatus] = useState({state:"ongoing"});
    // nước đi đang chờ chọn quân phong: { from, to } | null
    const [pendingPromotion,setPendingPromotion] = useState(null);
    // cập nhật lượt
    const isMyTurn = mode === "pva" || turn === myColor;
    // load bàn cờ
    const loadBoard= useCallback(async()=>{
        try{
            const data = await fetchBoard(roomCode);
            console.log("Board API:", data); 
            if(data.board){
                setBoard(data.board);
                setTurn(data.turn);
                setGameStatus(data.game_status ?? DEFAULT_GAME_STATUS);
            }

        }
        catch(err){
            setError(err.message);
        }
    },[roomCode]);
    //
    useEffect(()=>{
        setLoading(true);
        loadBoard().finally(()=>setLoading(false));
    },[loadBoard]);
    /*useEffect(()=>{
        setLoading(true)
        fetchBoard()
            .then((data)=>{
                // fetchBoard có thể trả về mảng 8×8 hoặc object { board, turn, game_status }
                if(Array.isArray(data)){
                    setBoard(data);
                }
                else {
                    setBoard(data.board);
                    if(data.turn){
                        setTurn(data.turn);
                    }
                    if(data.game_status){
                        setGameStatus(data.game_status);
                    }
                }
            })
            .catch((err)=>setError(err.message))
            .finally(()=>setLoading(false));
    },[]);*/
    // POLLING (PVP)
    useEffect(()=>{
        if(mode !== "pvp"){
            return;
        }
        const interval = setInterval(()=>{loadBoard();},pollInterval);
        return ()=> clearInterval(interval);
    },[mode,loadBoard,pollInterval]);
    // hàm xử lý kết quả trả về từ server khi gửi move 
    const applyMoveResult = useCallback((result)=>{
        if(!result){
            return;
        }
        if(result.board){
            setBoard(result.board);
        }
        if (result.status === "invalid") {
            setMoveStatus("invalid");
            setTimeout(() => setMoveStatus(null), 1500);
            return;
        }
        setTurn(result.turn ?? "white");
        setGameStatus(result.game_status ?? DEFAULT_GAME_STATUS);
        // nếu tất cả không thì di chuyển là null
        setMoveStatus(null);
    },[])
    // hàm xử lý phong quân 
    const handlePromotionSelect = useCallback(
        // truyên vào tham quân cờ phong
        async (promotionPiece)=>{
            // nếu không phong quân không làm gì cả
            if(!pendingPromotion){
                return;
            }
            // tọa độ gán được gán bằng pendingPromotion
            const {from,to} = pendingPromotion;
            // set lại null
            setPendingPromotion(null);
            // set trạng thái là suy nghĩ
            setMoveStatus("thinking");
            // đúng 
            try {
                // gửi quân phong và tọa độ đi
                const result = await sendMove(from,to,promotionPiece,roomCode);
                applyMoveResult(result); 
            }
            // sai
            catch(err){
                // nhả lỗi
                setError(err.message);
                setMoveStatus(null);
            }
        },
        [pendingPromotion,applyMoveResult,roomCode]
    );
    // lưu một function click để re-render
    const handleCellClick = useCallback(
        async (row , col)=>{
            // đang chờ phong quân nếu có , không cho click
            if (pendingPromotion) return;
            // quy trình cụ thể là khi chưa chọn -> chọn ô -> + bỏ chọn ô đó hoặc chọn ô khác
            // nếu là move status thì trả về (đang chờ ai suy nghĩ) không cho nhấn chuột
            if (moveStatus ==="thinking"||gameStatus.state === "checkmate"||gameStatus.state ==="stalemate"){
                return;
            }
            // chặn lượt pvp
            if (!isMyTurn){
                return;
            }
            // vị trị quân cờ hiện tại
            const clickedPiece = board[row]?.[col];
            // màu sắc hiện tại của quân cờ
            const clickedColor = pieceColor(clickedPiece);
            // nếu chọn đúng lượt (turn) cùng màu thì lấy ví trí hiện tại
            if (!selected){
                // chỉ chọn khi đúng lượt
                if (clickedColor!==turn){
                    return ;
                }
                setSelected({row, col});
                // Lấy nước đi hợp lệ từ server để highlight
                try{
                    const moves = await fetchLegalMoves(row,col);
                    setLegalMoves(moves);
                }
                catch{
                    setLegalMoves([]);
                }
                return;
            }
            // nếu đã chọn rồi mà muốn bỏ chọn thì hãy bỏ chọn bỏ chọn sau khi chọn
            if (selected.row === row&&selected.col===col){
                setSelected(null);
                setLegalMoves([]);
                return;
            }
            // nếu chọn khác màu thì chọn ô đó
            if(pieceColor(clickedPiece)===turn){
                setSelected({row,col});
                try {
                    const moves = await fetchLegalMoves(row,col);
                    setLegalMoves(moves);
                }
                catch{
                    setLegalMoves([]);
                }
                return ;
            }
            // gửi lên server
            const from = selected;
            const to= {row,col};
            setSelected(null);
            setLegalMoves([]);
            // kiểm tra có cần phong quân không
            if(isPromotionMove(board,from,to)){
                // lưu lại và mởi modal - chưa gửi lên server
                setPendingPromotion({from,to});
                return;
            }
            setMoveStatus("thinking");
            try{
                const result = await sendMove(from,to,null,roomCode);
                applyMoveResult(result);
                /*// Cập nhật bàn cờ dù hợp lệ hay không
                if (result.board){
                    setBoard(result.board);
                }
                if(result.status ==="invalid"){
                    setMoveStatus("invalid");
                    setTimeout(() => setMoveStatus(null), 1500);
                    return;
                }
                // Cập nhật lượt và trạng thái game
                if(result.turn){
                    setTurn(result.turn)   
                }
                if(result.game_status){
                    setGameStatus(result.game_status);
                }
                setMoveStatus(null);
                // Nước hợp lệ → đổi lượt (hoặc dùng turn từ server nếu có)
                //setTurn((prev) => (prev === "white" ? "black" : "white"));
                //setMoveStatus(result.status ?? "ok");
                //setTimeout(() => setMoveStatus(null), 1500);*/
            }
            catch(err){
                setError(err.message);
                setMoveStatus(null);
            }
        },
        [board, selected, turn, moveStatus,gameStatus,pendingPromotion,isMyTurn,roomCode,applyMoveResult]
    );
    // reset game
    const resetGame = useCallback(async()=>{
        try{
            const data = await apiResetGame();
            setBoard(data.board);
            setTurn(data.turn ?? "white");
            setGameStatus(data.game_status ?? { state: "ongoing" });
            setSelected(null);
            setLegalMoves([]);
            setMoveStatus(null);
            setPendingPromotion(null);
            setError(null);
        }
        catch(err){
            setError(err.message);
        }
    },[roomCode]);
    //Helper: ô có nằm trong danh sách hợp lệ không
    const isLegalTarget = useCallback(
         (row, col) => legalMoves.some((m) => m.row === row && m.col === col),[legalMoves]
    )
    return {board,loading,error,selected,legalMoves,isLegalTarget,turn,moveStatus,gameStatus,handleCellClick,resetGame,pendingPromotion,handlePromotionSelect,isMyTurn};
};
export default useBoard;