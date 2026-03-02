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
 * @returns {Promise<{ board: string[][], status: string, message?: string }>}
 */
// gửi nước đi lên server sendmove
export const sendMove = async(from,to)=>{
    const res = await fetch(`${BASE_URL}/move`,{
        method:"POST",
        headers:{"Content_Type":"application/json"},
        body:JSON.stringify({from,to}),
    });
    if (!res.ok) throw new Error(`!Lỗi Http trạng thái:${res.status}`);
    return res.json();

};