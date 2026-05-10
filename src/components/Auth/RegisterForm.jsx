import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import "../../styles/register.css";

const RegisterForm = () => {
    const { register, loading } = useAuth();

    const [form, setForm] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: ""
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        // validate
        if (!form.username || !form.email || !form.password) {
            return setError("Vui lòng nhập đầy đủ thông tin");
        }

        if (!validateEmail(form.email)) {
            return setError("Email không hợp lệ");
        }

        if (form.password.length < 6) {
            return setError("Mật khẩu phải >= 6 ký tự");
        }

        if (form.password !== form.confirmPassword) {
            return setError("Mật khẩu không khớp");
        }

        const result = await register({
            username: form.username,
            email: form.email,
            password: form.password
        });

        if (result.success) {
            setSuccess("Đăng ký thành công");

            setForm({
                username: "",
                email: "",
                password: "",
                confirmPassword: ""
            });
        } else {
            setError(result.message || "Đăng ký thất bại");
        }
    };

    return (
        <div className="register-container">
            <div className="register-card">
                <h2>Tạo tài khoản</h2>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Tên người dùng</label>
                        <input
                            type="text"
                            name="username"
                            placeholder="Nhập username..."
                            value={form.username}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            placeholder="example@gmail.com"
                            value={form.email}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Mật khẩu</label>
                        <input
                            type="password"
                            name="password"
                            placeholder="••••••••"
                            value={form.password}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Xác nhận mật khẩu</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            placeholder="••••••••"
                            value={form.confirmPassword}
                            onChange={handleChange}
                        />
                    </div>

                    <button className="register-btn" type="submit" disabled={loading}>
                        {loading ? "Đang xử lý..." : "Đăng Ký Ngay"}
                    </button>
                </form>

                {error && <div className="msg msg-error">{error}</div>}
                {success && <div className="msg msg-success">{success}</div>}
            </div>
        </div>
    );
};

export default RegisterForm;