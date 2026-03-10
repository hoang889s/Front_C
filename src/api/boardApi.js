// khu vực thực hiện nhận và gửi dữ liệu từ server sang client và ngược lại
const BASE_URL = "http://127.0.0.1:8000";
export const  fetchBoard = async() =>{
    const res = await fetch(`${BASE_URL}/board`);
    if(!res.ok) throw new Error(`HTTP Lỗi trạng thái:${res.status}`);
    return res.json();
};
/**
 * Gửi nước đi lên server.
 * @param {{row: number, col: number}} from - Ô xuất phát
 * @param {{row: number, col: number}} to   - Ô đích
 * @param {string|null} promotion           - Quân phong nếu có: "Q"|"R"|"B"|"N"
 * @returns {Promise<{ board: string[][], status: string, message?: string }>}
 */
// gửi nước đi lên server sendmove
export const sendMove = async(from,to,promotion=null)=>{
    const body = {from,to};
    if(promotion){
        body.promotion = promotion;
    }
    const res = await fetch(`${BASE_URL}/move`,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({from,to}),
    });
    if (!res.ok) throw new Error(`!Lỗi Http trạng thái:${res.status}`);
    return res.json();

};
/**
 * Lấy danh sách nước đi hợp lệ cho quân tại ô (row, col).
 * @param {number} row
 * @param {number} col
 * @returns {Promise<{ row: number, col: number }[]>}
 */

export const fetchLegalMoves = async(row,col)=>{
    const res = await fetch(`${BASE_URL}/legal-moves?row=${row}&col=${col}`);
    if(!res.ok){
        throw new Error(`HTTP Lỗi trạng thái: ${res.status}`);
    }
    const data = await res.json();
    return data.moves ?? [];
}
/**
 * Reset game về trạng thái ban đầu.
 * @returns {Promise<{ board: string[][], turn: string, game_status: object }>}
 */
export const resetGame = async () =>{
    const res = await fetch(`${BASE_URL}/reset`, { method: "POST" });
    if (!res.ok){
        throw new Error(`HTTP Lỗi trạng thái: ${res.status}`);
    }
    return res.json();
}