import { Link } from "react-router-dom";
//import { useAuthLogic } from "../../hooks/useAuth";
import { useAuth } from "../../context/AuthContext";
const Navbar = () => {
  const { token, logout } = useAuth();

  return (
    <nav>
      <Link to="/">Home</Link>

      {token ? (
        <button onClick={logout}>Logout</button>
      ) : (
        <Link to="/login">Login</Link>
      )}
    </nav>
  );
};

export default Navbar;