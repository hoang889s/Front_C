import { Link } from "react-router-dom";
const HomePage = () =>{
    return(
        <div>
            <h1>Trang chủ</h1>
            <Link to="create-room">Tạo phòng và chơi</Link>
        </div>
    );
}
export default HomePage;