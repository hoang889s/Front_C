import { BrowserRouter, Routes, Route } from "react-router-dom";

// Pages
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import GamePage from "./pages/GamePage";
import NotFoundPage from "./pages/NotFoundPage";

// Components
import Navbar from "./components/Common/Navbar";
import AuthGuard from "./components/Auth/AuthGuard";


import { AuthProvider } from "./context/AuthContext";

const App = () => {
 return (
  <AuthProvider> {/* BỌC Ở ĐÂY */}
    <BrowserRouter>
      <Navbar />
      <Routes>

        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected routes */}
        <Route
            path="/"
            element={
                <AuthGuard><HomePage/></AuthGuard>
            }
        />

        <Route
            path="/game/:gameId"
            element={
                <GamePage/>
            }
        />

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />

      </Routes>
    </BrowserRouter>
  </AuthProvider>
 )
}

export default App;