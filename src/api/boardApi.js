const BASE_URL = "http://127.0.0.1:8000";
export const  fetchBoard = async() =>{
    const res = await fetch(`${BASE_URL}/board`);
    if(!res.ok) throw new Error(`HTTP Lỗi trạng thái:${res.status}`);
    return res.json();
};