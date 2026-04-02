
//import { getToken } from "./authApi";
const BASE_URL = "http://127.0.0.1:8000";
const getToken = () => localStorage.getItem("chess_token");
// hàm debug
function debugToken() {
    const token = getToken();
    console.log("Token value:", token);
    console.log("Token type:", typeof token);
    if (!token || token === "null" || token === "undefined") {
        console.error("TOKEN TRỐNG hoặc không hợp lệ!");
    } else {
        console.log("Header sẽ gửi:", `Bearer ${token}`);
    }
    return token;
}
async function handleResponse(res){
    const text = await res.text();
    let data ;
    try{
        data = JSON.parse(text);
    }
    catch(err){
        console.error(" Response không phải JSON:", text);
        throw new Error("Server trả về HTML hoặc lỗi");
    }
    if(!res.ok){
        console.error("API ERROR:", data);
        throw new Error(data.message || "API error");
    }
    return data;
}
export async function getRooms(){
    //debugToken()
    const res = await fetch(`${BASE_URL}/rooms/`,{
        method:"GET",
        headers:{
            Authorization: `Bearer ${getToken()}`
        }
    });
    //return res.json();
    return handleResponse(res);
}
export async function createRoom(data){
    const res = await fetch(`${BASE_URL}/rooms/create`,{
        
        method: "POST",
        headers:{
            "Content-Type":"application/json",
            Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify(data)
    })
    console.log(res);
    //return res.json();
    return handleResponse(res);
}
export async function joinRoom(code,password){
    const res = await fetch(`${BASE_URL}/rooms/join`,{
        method: "POST",
        headers :{
            "Content-Type":"application/json",
            Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify({code,password})
    },)
    return handleResponse(res);
    //return res.json();
}