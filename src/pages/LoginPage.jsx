import LoginForm from "../components/Auth/LoginForm";
import RegisterForm from "../components/Auth/RegisterForm";
import "../styles/loginpage.css";
const LoginPage = () =>{
    return (
    <div className="auth-page-container">
      {/* 
         Mỗi component bên dưới đã được style sẵn là một 'card' 
         nên chúng sẽ tự động đứng cạnh nhau nhờ Flexbox ở container cha.
      */}
      
      <div className="auth-section">
        <LoginForm />
      </div>
      
      <div className="auth-section">
        <RegisterForm />
      </div>
    </div>
  );
}
export default LoginPage;