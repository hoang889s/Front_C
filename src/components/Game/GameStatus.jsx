import "../../styles/theme.css";
const GameStatus = ({ status, currentTurn, players, winner }) => {
    // Normalize players về array
    const safePlayers = Array.isArray(players) ? players :players?Object.values(players):[];
    const renderStatus = () => {
        switch (status) {
            case "waiting":
                return "Đang chờ người chơi...";
            case "ongoing":
                return " Đang chơi";
            case "finished":
                return " Kết thúc";
            default:
                return "Không xác định";
        }
    }
    const renderTurn = () =>{
        if (status !== "playing"){
            return null;
        }
        return (
            <div className="turn">
                Lượt: <strong>{currentTurn}</strong>
            </div>
        );
    };
    const renderWinner = () =>{
        if (status !== "finished" || !winner){
            return null;
        }
        return(
            <div className="winner">
                Người thắng: <strong>{winner}</strong>
            </div>
        );
    };
    return(
        <div className="game-status">
            <h3>Trạng thái game</h3>
            <div className="status">{renderStatus()}</div>
            {renderTurn()}
            {renderWinner()}
            <div className="players">
                <h4>Người chơi</h4>
                {safePlayers.length === 0 ? (
                    <p>Chưa có người chơi</p>
                ):(
                    <ul>
                        {safePlayers.map((p, index) => (
                            <li key={index}>
                                {p?.username || p} {/* linh hoạt dữ liệu */}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};
export default GameStatus;