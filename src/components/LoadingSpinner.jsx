const LoadingSpinner = ({ message = "Đang tải..." }) => (
  <div style={{ padding: "20px", fontSize: "18px", color: "#555" }}>
    {message}
  </div>
);

export default LoadingSpinner;