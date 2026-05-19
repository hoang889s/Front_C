import { Link } from "react-router-dom";
//import { useAuthLogic } from "../../hooks/useAuth";
import { useAuth } from "../../context/AuthContext";
import "../../styles/navbar.css";
const Navbar = () => {
  const { token, logout } = useAuth();
  const handleLogout = async () =>{
    try{
      console.log("[UI] Logout button clicked");
      // gọi hàm logout
      await logout();
      console.log("[UI] Logout completed, redirecting...");
      // Redirect về login (tùy chọn, có thể để context tự handle)
      window.location.href = "/login";
    }
    catch (error){
      console.error("[UI] Logout error:", error);
      alert("Logout failed: " + error.message);
    }
  };
  return (
    <nav className="navbar">
      <div className="logo">
        <Link to="/" className="nav-link" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
          CHESS GAME
        </Link>
      </div>

      <div className="nav-links">
        <Link title="Home" to="/" className="nav-link">Trang chủ</Link>

        {token ? (
          <button className="logout-btn" onClick={handleLogout}>
            Đăng xuất
          </button>
        ) : (
          <Link to="/login" className="nav-link">
            Login
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;