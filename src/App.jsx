import { useState } from "react";
import GamePage from "./pages/GamePage";
import OnlinePage from "./pages/OnlinePage";
import AuthPage from "./pages/AuthPage";
import { logout } from "./api/authApi";
const PAGES ={
  vs_ai: { label: "Chơi với Máy", component: GamePage },
  online: { label: "Chơi Online", component: OnlinePage },
}
const App = () => {
  const [currentPage,setCurrentPage] = useState("vs_ai");
  
  // khai báo user state để lưu thông tin người dùng sau khi đăng nhập thành công, hiện tại chưa sử dụng nhưng sẽ cần trong tương lai khi triển khai tính năng online
  const [user, setUser] = useState(null);
  // Callback khi AuthPage đăng nhập / đăng ký thành công
  const handleAuthSuccess = (userData) => {
    setUser(userData);
  };
   // Đăng xuất
  const handleLogout = async () => {
    await logout();
    setUser(null);
  };
  // Nếu chưa đăng nhập → hiện AuthPage
  if (!user) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }
  const PageComponent = PAGES[currentPage].component;
  return(
    <div style={appStyle}>
      {/*top nav*/}
      <nav style={navStyle}>
        <span style={logoStyle}>Chess app</span>
        <div style={tabsStyle}>
          {Object.entries(PAGES).map(([key,{label}])=>(
            <button
              key={key}
              onClick ={()=>setCurrentPage(key)}
              style={tabStyle(currentPage === key)}
            >
              {label}
            </button>
          ))}
        </div>
        {/* Thông tin user + nút đăng xuất */}
        <div style={userAreaStyle}>
          <span style={usernameStyle}>♟ {user.username}</span>
          <button style={logoutBtnStyle} onClick={handleLogout}>
             Đăng xuất
          </button>

        </div>
      </nav>
       {/* Page Content */}
      <main>
        <PageComponent />
      </main>
    </div>
  );
};
const appStyle ={
  minHeight: "100vh",
  backgroundColor: "#fafafa",
  fontFamily: "sans-serif",
};
const navStyle = {
  display: "flex",
  alignItems: "center",
  gap: "24px",
  padding: "12px 24px",
  backgroundColor: "#1a1a2e",
  borderBottom: "2px solid #e94560",
  boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
}
const logoStyle ={
  color: "#e94560",
  fontWeight: "bold",
  fontSize: "20px",
  letterSpacing: "1px",
  marginRight: "auto",
}
const tabsStyle = {
  display: "flex",
  gap: "8px",
};

const tabStyle = (active) => ({
  padding: "8px 18px",
  fontSize: "14px",
  fontWeight: active ? "bold" : "normal",
  cursor: "pointer",
  border: "none",
  borderRadius: "6px",
  backgroundColor: active ? "#e94560" : "transparent",
  color: active ? "#fff" : "#ccc",
  transition: "background 0.2s, color 0.2s",
});
const userAreaStyle = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  marginLeft: "auto",
};
const usernameStyle = {
  color: "#e2e8f0",
  fontSize: "14px",
};
 
const logoutBtnStyle = {
  padding: "6px 14px",
  fontSize: "13px",
  cursor: "pointer",
  border: "1px solid #e94560",
  borderRadius: "6px",
  backgroundColor: "transparent",
  color: "#e94560",
  transition: "background 0.2s, color 0.2s",
};
export default App;