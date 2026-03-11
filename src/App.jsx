import { useState } from "react";
import GamePage from "./pages/GamePage";
import OnlinePage from "./pages/OnlinePage";
const PAGES ={
  vs_ai: { label: "Chơi với Máy", component: GamePage },
  online: { label: "Chơi Online", component: OnlinePage },
}
const App = () => {
  const [currentPage,setCurrentPage] = useState("vs_ai");
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
export default App;