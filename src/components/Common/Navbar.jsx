import { Link } from "react-router-dom";
//import { useAuthLogic } from "../../hooks/useAuth";
import { useAuth } from "../../context/AuthContext";
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
    <nav>
      <Link to="/">Home</Link>

      {token ? (
        <button onClick={handleLogout}>Logout</button>
      ) : (
        <Link to="/login">Login</Link>
      )}
    </nav>
  );
};

export default Navbar;