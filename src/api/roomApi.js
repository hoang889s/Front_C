import { getToken }  from "./authApi";
const BASE_URL = "http://127.0.0.1:8000/rooms";
const getHeaders = () =>({
    "Content-Type": "application/json",
    "Authorization": `Bearer ${getToken()}`
});
// check lỗi http res.ok
const request = async(url, options = {}) => {
  try{
    const res = await fetch(url, {
      headers: getHeaders(),
      ...options,
      headers:{
        ...getHeaders(),
        ...(options.headers||{})  
      }
    });
    const data = await res.json();
    if(!res.ok){
      throw new Error(data.message || "API Error");
      
    }
    return data;
  }
  catch(err){
    console.error("API ERROR:", err.message);
    return{
      success: false,
      message: err.message
    }
  }
};
export const createRoom = async ({name,is_private=false,password=null,mode="human",time_limit=600,preferred_color = "random"}) => {
  return request(BASE_URL,{
    method:"POST",
    body: JSON.stringify({
      name,
      is_private,
      password,
      mode,
      time_limit,
      preferred_color,
    })
  })
};
export const joinRoom = async (code, password = null) => {
  if(!code){
    return { success: false, message: "Thiếu mã phòng" };
  }
  return request(`${BASE_URL}/join`,{
    method:"POST",
    body: JSON.stringify({ code, password })
  })
};
export const leaveRoom = async (roomId) => {
  if(!roomId){
    return { success: false, message: "Thiếu room_id" };
  }
  return request(`${BASE_URL}/leave`,{
    method: "POST",
    body: JSON.stringify({ room_id: roomId })
  })
};
// lấy danh sách phòng
export const getRooms = async()=>{
  return request(BASE_URL,{
    method:"GET"
  });
};
// lây thông tin chi tiết một phòng
export const getRoomDetail = async(roomId)=>{
  return request(`${BASE_URL}/${roomId}`,{
    method: "GET"
  })
}