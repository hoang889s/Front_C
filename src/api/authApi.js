// src/api/authApi.js
// Giao tiếp với backend Auth endpoints
 
const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
//  Helpers 
const getToken = () => localStorage.getItem("chess_token");
const setToken = (token) => localStorage.setItem("chess_token",token);
const removeToken = () => localStorage.removeItem("chess_token");
const authHeaders = () => {
    const token = getToken();
    return token ? {"Content-Type":"application/json",Authorization:`Bearer ${token}`}:{"Content-Type":"application/json"};

};
// gọi api
/**
 * Đăng ký tài khoản mới
 * @param {string} username
 * @param {string} email
 * @param {string} password
 */
export const register = async (username,email,password)=>{
    const res = await fetch(`${BASE_URL}/auth/register`,{
        method:"POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({username,email,password}),


    });
    const data = await res.json();
    if(data.token){
        setToken(data.token);
        
    }
    return {ok:res.ok,data}
};
/**
 * Đăng nhập
 * @param {string} username
 * @param {string} password
 */
export const login = async(username,password)=>{
    const res = await fetch(`${BASE_URL}/auth/login`,{
        method:"POST",
        headers:{"Content-Type": "application/json" },
        body:JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if(data.token) {
        setToken(data.token)
    }
    return {ok:res.ok,data}

};
/**
 * Lấy thông tin user đang đăng nhập
 */
export const getMe = async()=>{
    const res = await fetch(`${BASE_URL}/auth/me`, {
        headers: authHeaders(),
    });
    const data = await res.json();
    return {ok:res.ok,data};
};
// đăng xuất
export const logout = async () => {
  await fetch(`${BASE_URL}/auth/logout`, {
    method: "POST",
    headers: authHeaders(),
  });
  removeToken();
};
export { getToken, setToken, removeToken };