import { useParams } from "react-router-dom";
import GameReplay from "../replay/Gamereplay";

const ReplayPage = () =>{
    const {gameId } = useParams();
    const token = localStorage.getItem("token");
    return(<>
        <GameReplay
            gameId={gameId}
            token={token}
        />
    </>);
}
export default ReplayPage;