import {useState, useEffect} from "react";
import {getUsers, updateUser, deleteUser} from "../api/adminApi";
const AdminPage = () =>{
    const [users,setUsers] = useState([]);
    const [total,setTotal] = useState(0);
    const [page,setPage] = useState(1);
    const [loading,setLoading] = useState(false);
    const [error,setError] = useState(null);
    const [editUser, setEditUser] = useState(null);
    const [editForm,setEditForm] = useState({});
    const [msg,setMsg] = useState(null);
    const PER_PAGE = 10;
    // load danh sách users
    const loadUsers = async()=>{
        setLoading(true);
        setError("");
        try{
            const data= await getUsers(page,PER_PAGE);
            if(data.status === "ok"){
                setUsers(data.users);
                setTotal(data.total);
            }
            else{
                setError(data.message || "Lỗi tải dánh sách");
            }
        }
        catch(err){
            setError("không thể kết nối đến server");
        }
        setLoading(false);
    }
    useEffect(()=>{
        loadUsers();
    },[page]);
    // mở form edit
    const handleEdit = (user)=>{
        setEditUser(user);
        setEditForm({
            username: user.username,
            email: user.email,
            role: user.role,
            password:"",
        });
        setMsg("");
    }
    // Lưu edit
    const handleSave = async()=>{
        const payload = {
            ...editForm
        };
        if (!payload.password){
            delete payload.password;
        }
        const data = await updateUser(editUser.id,payload);
        if(data.status === "ok"){
            setMsg("Cập nhật thành công");
            setEditUser(null);
            loadUsers();
        }
        else{
            setMsg(data.message || "Lỗi cập nhật user");
        }
    };
    // Xóa user
    const handleDelete = async(user)=>{
        if(!window.confirm(`Bạn có chắc muốn xóa user ${user.username}?`)){
            return;
        }
        const data = await deleteUser(user.id);
        if(data.status === "ok"){
            setMsg("Xóa user thành công");
            loadUsers();
        }
        else{
            setMsg(data.message || "Lỗi xáo user");

        }
    };
    const totalPages = Math.ceil(total / PER_PAGE);
    return (
        <div style={pageStyle}>
            <h2 style ={tytleStyle}>
                Quản lý người dùng
            </h2>
             {msg   && <div style={msgStyle(msg.includes("Lỗi") || msg.includes("không"))}>{msg}</div>}
            {/* Bảng danh sách */}
            {loading ? (<p style={{ color: "#aaa", textAlign: "center" }}>Đang tải ...</p>):(<table style={tableStyle}>
                <thead>
                    <tr>
                        {["ID","Username","Email","Role","Hành động"].map(h=>(
                            <th key={h} style={thStyle}>{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {users.map(u=>(
                        <tr key={u.id} style={trStyle}>
                            <td style={tdStyle}>{u.id}</td>
                            <td style={tdStyle}>{u.username}</td>
                            <td style={tdStyle}>{u.email}</td>
                            <td style={tdStyle}>
                                <span style={roleBadge(u.role)}>{u.role}</span>
                            </td>
                            <td style={tdStyle}>
                                <button style={btnEdit} onClick={() => handleEdit(u)}>Sửa</button>
                                <button style={btnDelete} onClick={() => handleDelete(u)}>Xóa</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        )}
        {/* Phân trang */}
        {totalPages > 1 && (
            <div style={paginationStyle}>
                <button style={pageBtn} disabled={page === 1} onClick={() => setPage(p => p - 1)}>Trước</button>
                <span style={{ color: "#ccc", fontSize: "13px" }}>Trang {page} / {totalPages}</span>
                <button style={pageBtn} disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Sau</button>
            </div>
        )}
        {/* Modal edit */}
        {editUser && (
            <div style={overlayStyle}>
                <div style={modalStyle}>
                    <h3 style={{ color: "#e2e8f0", marginTop: 0 }}>Chỉnh sửa: {editUser.username}</h3>
                    {["username","email","role","password"].map(field=>(
                        <div key={field} style={{ marginBottom: "12px" }}>
                            <label style={labelStyle}>
                                {field === "password" ? "Mật khẩu mới (để trống = không đổi)" : field}
                            </label>
                            <input
                                style={inputStyle}
                                type={field === "password" ? "password" : "text"}
                                value={editForm[field] || ""}
                                onChange={e => setEditForm(f => ({ ...f, [field]: e.target.value }))}
                                placeholder={field === "password" ? "Nhập để đổi mật khẩu..." : ""}
                            />
                        </div>
                    ))}
                    <div style={{ marginBottom: "16px" }}>
                        <label style={labelStyle}>Role</label>
                        <select
                            style={inputStyle}
                            value={editForm.role}
                            onChange={e => setEditForm(f => ({ ...f, role: e.target.value }))}
                        >
                            <option value="user">user</option>
                            <option value="admin">admin</option>
                        </select>
                    </div>
                    {msg && <div style={msgStyle(msg.includes("Lỗi"))}>{msg}</div>}
                    <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                        <button style={btnCancel} onClick={() => setEditUser(null)}>Hủy</button>
                        <button style={btnSave} onClick={handleSave}>Lưu</button>
                    </div>
                </div>
            </div>
        )}
        </div>
    )
};
const pageStyle   = { padding: "24px", maxWidth: "900px", margin: "0 auto" };
const tytleStyle = {color:"#e2e8f0", marginBottom: "20px"};
const tableStyle  = { width: "100%", borderCollapse: "collapse", fontSize: "14px" };
const thStyle     = { padding: "10px 14px", textAlign: "left", color: "#94a3b8", borderBottom: "1px solid #334155", fontWeight: "500" };
const trStyle     = { borderBottom: "1px solid #1e293b" };
const tdStyle     = { padding: "10px 14px", color: "#e2e8f0" };
const paginationStyle = { display: "flex", alignItems: "center", gap: "16px", marginTop: "20px", justifyContent: "center" };
const pageBtn     = { padding: "6px 14px", background: "transparent", border: "1px solid #334155", color: "#94a3b8", borderRadius: "6px", cursor: "pointer", fontSize: "13px" };
const btnEdit     = { marginRight: "8px", padding: "4px 12px", background: "transparent", border: "1px solid #3b82f6", color: "#3b82f6", borderRadius: "5px", cursor: "pointer", fontSize: "12px" };
const btnDelete   = { padding: "4px 12px", background: "transparent", border: "1px solid #e94560", color: "#e94560", borderRadius: "5px", cursor: "pointer", fontSize: "12px" };
const overlayStyle = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 };
const modalStyle  = { background: "#1e293b", borderRadius: "12px", padding: "28px", width: "420px", maxWidth: "90vw" };
const labelStyle  = { display: "block", color: "#94a3b8", fontSize: "13px", marginBottom: "6px" };
const inputStyle  = { width: "100%", padding: "8px 12px", background: "#0f172a", border: "1px solid #334155", borderRadius: "6px", color: "#e2e8f0", fontSize: "14px", boxSizing: "border-box" };
const btnSave     = { padding: "8px 20px", background: "#e94560", border: "none", color: "#fff", borderRadius: "6px", cursor: "pointer", fontWeight: "500" };
const btnCancel   = { padding: "8px 20px", background: "transparent", border: "1px solid #334155", color: "#94a3b8", borderRadius: "6px", cursor: "pointer" };
const msgStyle    = (isError) => ({ padding: "8px 12px", borderRadius: "6px", marginBottom: "12px", fontSize: "13px", background: isError ? "#3b1219" : "#0f3b2a", color: isError ? "#f87171" : "#4ade80" });
const roleBadge   = (role) => ({ padding: "2px 10px", borderRadius: "99px", fontSize: "12px", fontWeight: "500", background: role === "admin" ? "#7c3aed22" : "#1e293b", color: role === "admin" ? "#a78bfa" : "#94a3b8", border: `1px solid ${role === "admin" ? "#7c3aed" : "#334155"}` });
export default AdminPage;


