import { Link } from "react-router-dom";
const HomePage = () =>{
    return(
        <div>
            <h1>Trang chủ</h1>
            <Link to="create-room">Tạo phòng và chơi</Link>
            <Link to="join-room">Vào phòng</Link>
        </div>
    );
}
export default HomePage;