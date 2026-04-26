import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

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
        <div>
            <h2>Login</h2>

            <form onSubmit={handleSubmit}>
                <input name="username" onChange={handleChange} />
                <input name="password" type="password" onChange={handleChange} />

                <button disabled={loading}>
                    {loading ? "Loading..." : "Login"}
                </button>

                {error && <p>{error}</p>}
            </form>
        </div>
    );
};

export default LoginForm;