// src/pages/AuthPage.jsx
import { useState } from "react";
import { register, login } from "../api/authApi";
/**
 * AuthPage – trang Đăng ký / Đăng nhập
 * Props:
 *   onAuthSuccess(user) – callback khi auth thành công
 */
const AuthPage = ({onAuthSuccess})=>{
    // "login" | "register"
    const [mode,setMode] = useState("login");
    const [username,setUsername] = useState("");
    const [email,setEmail] = useState("");
    const [password,setPassword] = useState("");
    const [error,setError] = useState("");
    const [loading,setLoading] = useState(false);
    const isLogin = mode === "login";
    const handleSubmit = async(e)=>{
        e.preventDefault();
        setError("");
        setLoading(true);
        try{
            const result = isLogin ? await login(username,password):await register(username,email,password);
            if (result.ok){
                onAuthSuccess(result.data.user);
            }
            else {
                setError(result.data.message || "Đã có lỗi xảy ra, vui lòng thử lại");
            }
        }
        catch{
            setError("Không thể kết nối với Server");
        }
        finally{
            setLoading(false);
        }
    };
    return (
        <div style={styles.overlay}>
            <div style={styles.card}>
                {/* Logo / tiêu đề */}
                <div style={styles.header}>
                    <span style={styles.icon}>♟</span>
                    <h1 style={styles.title}>Trò chơi Cờ Vua</h1>
                </div>
                {/* Tab chuyển đổi */}
                <div style={styles.tabs}>
                    <button  style={{ ...styles.tab, ...(isLogin ? styles.tabActive : {}) }} onClick={() => { setMode("login"); setError(""); }}>
                        Đăng nhập
                    </button>
                    <button style={{ ...styles.tab, ...(!isLogin ? styles.tabActive : {}) }} onClick={() => { setMode("register"); setError(""); }}>
                        Đăng ký
                    </button>

                </div>
                {/* Form */}
                <form  onSubmit={handleSubmit} style={styles.form}>
                    <label  style={styles.label}>Username</label>
                    <input
                        style={styles.input}
                        type="text"
                        placeholder="Nhập username"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        required
                        autoComplete="username"
                    />
                    {!isLogin &&(
                        <>
                            <label style={styles.label}>Email</label>
                            <input
                                style={styles.input}
                                type="email"
                                placeholder="Nhập email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                                autoComplete="email"
                            />
                        </>
                    )}
                    <label style={styles.label}>Password</label>
                    <input
                        style={styles.input}
                        type="password"
                        placeholder="Nhập password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        autoComplete={isLogin ? "current-password" : "new-password"}
                    />
                    {error && <p style={styles.error}>{error}</p>}
                    <button
                        type = "submit"
                        style={{ ...styles.btn, opacity: loading ? 0.7 : 1 }}
                        disabled={loading}
                    >
                        {loading ? "Đang xử lý..." : isLogin ? "Đăng nhập" : "Tạo tài khoản"}
                    </button>
                </form>
            </div>
        </div>
    );
}
export default AuthPage;
//  Inline styles (không cần thêm CSS file) 
const styles = {
  overlay: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#1a1a2e",
  },
  card: {
    background: "#16213e",
    borderRadius: 16,
    padding: "40px 36px",
    width: "100%",
    maxWidth: 400,
    boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
  },
  header: {
    textAlign: "center",
    marginBottom: 24,
  },
  icon: {
    fontSize: 48,
  },
  title: {
    color: "#e2e8f0",
    fontSize: 22,
    fontWeight: 600,
    margin: "8px 0 0",
  },
  tabs: {
    display: "flex",
    background: "#0f3460",
    borderRadius: 8,
    padding: 4,
    marginBottom: 24,
    gap: 4,
  },
  tab: {
    flex: 1,
    padding: "8px 0",
    border: "none",
    borderRadius: 6,
    background: "transparent",
    color: "#94a3b8",
    fontSize: 14,
    cursor: "pointer",
    transition: "all 0.2s",
  },
  tabActive: {
    background: "#e2e8f0",
    color: "#1a1a2e",
    fontWeight: 600,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  label: {
    color: "#94a3b8",
    fontSize: 13,
    marginBottom: 2,
  },
  input: {
    background: "#0f3460",
    border: "1px solid #2d4a7a",
    borderRadius: 8,
    padding: "10px 14px",
    color: "#e2e8f0",
    fontSize: 14,
    outline: "none",
    marginBottom: 8,
  },
  error: {
    color: "#f87171",
    fontSize: 13,
    margin: "4px 0",
    background: "rgba(248,113,113,0.1)",
    padding: "8px 12px",
    borderRadius: 6,
  },
  btn: {
    marginTop: 8,
    padding: "12px 0",
    background: "#e2e8f0",
    color: "#1a1a2e",
    border: "none",
    borderRadius: 8,
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
    transition: "opacity 0.2s",
  },
};