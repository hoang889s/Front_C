const BASE_URL = "http://127.0.0.1:8000";
// lấy token
const getToken = () => localStorage.getItem("chess_token");
// hàm debug
const debugToken = () =>{
    const token = getToken();
    console.log("Token value:", token);
    console.log("Token type:", typeof token);
    if(!token||token==="null"||token==="undefined"){
        console.error("TOKEN TRỐNG hoặc không hợp lệ!");
    }
    else{
        console.log("Header sẽ gửi:", `Bearer ${token}`);
    }    
    return token;
};
// trả về respone chung
const handleResponse = async(res)=>{
    const text = await res.text();
    let data;
    try{
        data = JSON.parse(text);
    }
    catch(err){
        console.error("Response không phải JSON:", text);
        throw new Error("Server trả về HTML hoặc lỗi");
    }
    if (!res.ok){
        console.error("API ERROR:", data);
        throw new Error(data.message || "API error");
    }
    return data;
}
// lấy dữ  liệu nhiều phòng
export const getRooms = async (status = "waiting",mode)=>{
    const params = new URLSearchParams({status});
    if (mode) {
        params.append("mode",mode);
    }
    const res = await fetch(`${BASE_URL}/rooms/?${params}`, {
        method:"GET",
        headers:{
            Authorization:`Bearer ${getToken()}`,
        },
    });
    return handleResponse(res);
}
// lấy dữ liệu một phòng theo code
export const getRoom = async(code)=>{
    const res = await fetch(`${BASE_URL}/rooms/${code}`,{
        method:"GET",
        headers:{
            Authorization: `Bearer ${getToken()}`,
        }
    });
    return handleResponse(res);
}

// hàm tạo phòng từ api về
export const createRoom = async(data)=>{
    const res = await fetch(`${BASE_URL}/rooms/create`, {
        method: "POST",
        headers:{
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify(data),
    });
    console.log(res);
    return handleResponse(res);
}
// tham gia phòng
export const joinRoom = async(code , password)=>{
    const res = await fetch(`${BASE_URL}/rooms/join`, {
        method: "POST",
        headers:{
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify({ code, password })
    });
    return handleResponse(res);
}
// rời phòng
export const leaveRoom = async(code)=>{
    const res = await fetch(`${BASE_URL}/rooms/${code}/leave`, {
        method:"POST",
        headers:{
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`
        }
    });
    return handleResponse(res);
}
// kết thúc ván đấu
export const endRoom = async(code,result = "draw")=>{
    const res = await fetch(`${BASE_URL}/rooms/${code}/end`,{
        method:"POST",
        headers:{
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
        },
        body:JSON.stringify({result}),

    });
    return handleResponse(res)
}