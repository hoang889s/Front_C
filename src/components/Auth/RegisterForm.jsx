import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

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
        <div style={{ maxWidth: 400, margin: "0 auto" }}>
            <h2>Register</h2>

            <form onSubmit={handleSubmit}>
                <div>
                    <label>Username</label>
                    <input
                        type="text"
                        name="username"
                        value={form.username}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <label>Email</label>
                    <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <label>Password</label>
                    <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <label>Confirm Password</label>
                    <input
                        type="password"
                        name="confirmPassword"
                        value={form.confirmPassword}
                        onChange={handleChange}
                    />
                </div>

                <button type="submit" disabled={loading}>
                    {loading ? "Loading..." : "Register"}
                </button>
            </form>

            {error && <p style={{ color: "red" }}>{error}</p>}
            {success && <p style={{ color: "green" }}>{success}</p>}
        </div>
    );
};

export default RegisterForm;