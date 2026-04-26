import { Link } from "react-router-dom";
const HomePage = () =>{
    return(
        <div>
            <h1>Trang chủ</h1>
            <Link to="/game/1">Chơi game</Link>
        </div>
    );
}
export default HomePage;