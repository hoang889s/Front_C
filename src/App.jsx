import Board from "./components/Board";
import LoadingSpinner from "./components/LoadingSpinner";
import useBoard from "./hooks/useBoard";

const App = () => {
  const { board, loading, error } = useBoard();

  if (loading) return <LoadingSpinner message="Đang tải bàn cờ..." />;
  if (error) return <div style={{ color: "red" }}>Lỗi: {error}</div>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Chess Board</h2>
      <Board board={board} />
    </div>
  );
};

export default App;