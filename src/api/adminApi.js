import { getToken } from "./authApi";
const BASE = "http://127.0.0.1:8000/admin";
const authHeader =()=>({
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
});
// lấy danh sách user có phân trang
export const getUsers = async(page = 1,perPage = 20)=>{
    const res = await fetch(`${BASE}/users?page=${page}&per_page=${perPage}`,{
        headers: authHeader(),
    });
    return res.json();
};
// lấy chi tiết một user
export const getUserById = async(id)=>{
    const res = await fetch(`${BASE}/users/${id}`, { headers: authHeader() });
    return res.json();
};
// Cập nhật user (username, email, password, role)
export const updateUser = async (id,data)=>{
    const res = await fetch(`${BASE}/users/${id}`,{
        method: "PUT",
        headers: authHeader(),
        body: JSON.stringify(data),
    });
    return res.json();
};
// xóa user
export const deleteUser = async (id) => {
    const res = await fetch(`${BASE}/users/${id}`,{
        method:"DELETE",
        headers:authHeader(),
    });
    return res.json();
};