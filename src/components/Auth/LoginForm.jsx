import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../styles/login.css";

const LoginForm = () => {
    const navigate = useNavigate();
    const { login,isAuthenticated } = useAuth();
    useEffect(() => {
        if (isAuthenticated) {
            navigate("/");
        }
    },[isAuthenticated]);
    const [form, setForm] = useState({
        username: "",
        password: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const result = await login(form);

        if (!result.success) {
            setError(result.message);
        }

        setLoading(false);
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h2>Đăng Nhập</h2>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Tên đăng nhập</label>
                        <input 
                            name="username" 
                            type="text"
                            placeholder="Nhập username..."
                            onChange={handleChange} 
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Mật khẩu</label>
                        <input 
                            name="password" 
                            type="password" 
                            placeholder="••••••••"
                            onChange={handleChange} 
                            required
                        />
                    </div>

                    <button className="login-btn" disabled={loading} type="submit">
                        {loading ? "Đang xác thực..." : "Đăng Nhập"}
                    </button>

                    {error && <div className="error-msg">{error}</div>}
                </form>
            </div>
        </div>
    )
};

export default LoginForm;