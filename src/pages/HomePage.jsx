import { Link } from "react-router-dom";
import "../styles/homepage.css";
import IconLink1 from "../assets/link1.svg?react";
import IconLink2 from "../assets/link2.svg?react";

const HomePage = () =>{
    return (
        <div className="home-container">
            <h1>Chào mừng bạn</h1>

            <div className="menu-options">
                <Link to="/create-room" className="menu-card">
                    {/* Bạn có thể thêm icon nếu dùng FontAwesome, nếu không chỉ cần text */}
                    <div className="icon"><IconLink1/></div> 
                    <span>Tạo phòng & Chơi</span>
                    <p>Khởi tạo thế giới mới và mời bạn bè tham gia cùng bạn.</p>
                </Link>

                <Link to="/join-room" className="menu-card">
                    <div className="icon"><IconLink2/></div>
                    <span>Vào phòng</span>
                    <p>Nhập mã phòng để tham gia vào cuộc chơi đang diễn ra.</p>
                </Link>
            </div>
        </div>
    );
}
export default HomePage;