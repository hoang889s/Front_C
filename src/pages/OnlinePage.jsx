import { useEffect,useState } from "react";
import { useNavigate } from "react-router-dom";
import {getRooms,createRoom,joinRoom,leaveRoom} from "../api/roomApi";
 

const OnlinePage = ({onEnterRoom}) => {
  //const navigate = useNavigate();
  const [rooms,setRooms] = useState([]);
  const [code, setCode] = useState("");
  //const [myRoom,setMyRoom] = useState(null);
  const [loading,setLoading] = useState(false);
  // Modal tạo phòng
  const [showCreate,setShowCreate] = useState(false);
  const [createOpts,setCreateOpts] = useState({
    mode:"pvp",
    host_color:"white",
    password:"",
    time_limit:"",
  });

  useEffect(()=>{
    loadRooms();
  },[]);

  const loadRooms = async()=>{
    try{
      const data = await getRooms();
      setRooms(data.rooms||[]);
    }
    catch(err){
      console.error(err);
    }
  };

  const handleCreate = async()=>{
    //e.preventDefault();
    try{
      const payload = {
        mode: createOpts.mode,
        host_color: createOpts.host_color,
        ...(createOpts.password && {password:createOpts.password}),
        ...(createOpts.time_limit && { time_limit: parseInt(createOpts.time_limit) }),
      };
      const res = await createRoom(payload);
      setShowCreate(false);
      onEnterRoom(res.room,"host");
      //navigate(`/online/${res.room.code}`, { state: { room: res.room, role: "host" } });
      
    }
    catch (err){
      console.error("Tạo phòng thất bại:", err.message);
      alert(err.message);
    }
    finally{
      setLoading(false);  
    }
  };

  const handleLeave = async()=>{
    if (!myRoom) {
      return;
    }
    try{
      const data = await leaveRoom(myRoom.code);
      console.log("Rời phòng:",data);
      setMyRoom(null);
      loadRooms();
    }
    catch(err){
      console.error("Rời phòng thất bại:",err.message);
      alert(err.message);
    }
  }
  // vào bằng code phòng
  const handleJoinByCode = async()=>{
    if(!code.trim()){
      return alert("Nhập mã phòng");
    }
    setLoading(true);
    try{
      const res = await joinRoom(code.trim());
      onEnterRoom(res.room,"guest");

    }
    catch (err){
      alert(err.message);
    }
    finally{
      setLoading(false);
    }
  };
  // vào phòng công khai
  const handleJoinPublic = async(roomCode)=>{
    setLoading(true);
    try{
      const res = await joinRoom(roomCode);
      //navigate(`/online/${res.room.code}`, { state: { room: res.room, role: "guest" } });
      onEnterRoom(res.room,"guest");
    }
    catch (err){
      alert(err.message);
    }
    finally{
      setLoading(false);
    }
  }
  return (
      <div style={styles.page}>
        {/*Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>Chơi online</h1>
          <p style={styles.subtitle}>Thách đấu người chơi khác hoặc luyện tập với AI</p>
        </div>
        {/* Action Bar */}
        <div style={styles.actionBar}>
          <button styles={styles.btnPrimary} onClick={()=>setShowCreate(true)}>+ Tạo phòng</button>
          <div style={styles.joinRow}>
            <input
              style={styles.input}
              placeholder="Mã phòng (VD: A3F8C2D1)"
              value ={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && handleJoinByCode()}
            />
            <button style={styles.btnSecondary} onClick={handleJoinByCode}>Vào phòng</button>
          </div>
        </div>
        {/* Danh sách phòng */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Phòng công khai</h2>
            <button style={styles.btnRefresh} onClick={loadRooms}>Làm mới</button>
          </div>
          {rooms.length === 0?(
            <div style={styles.empty}>Chưa có phòng nào hãy tạo phòng đầu tiên!</div>
          ):(
            <div styles={styles.roomGrid}>
              {rooms.map((r)=>(
                <div key={r.id} style={styles.roomCard}>
                  <div style={styles.roomCode}>{r.code}</div>
                  <div style={styles.roomMeta}>
                    <span style={modeBadge(r.mode)}>{r.mode.toUpperCase()}</span>
                    <span style={styles.host}>người chơi:{r.host?.username || "?"}</span>
                  </div>
                  {r.time_limit &&(
                    <div style={styles.timeLimit}>{r.time_limit / 60} phút</div>
                  )}
                  <button style={styles.btnJoin} onClick={()=>handleJoinPublic(r.code)} disabled={loading}>
                    Tham gia
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Modal tạo phòng */}
        {showCreate &&(
          <div style={styles.overlay} onClick={() => setShowCreate(false)}>
            <div style={styles.modal} onClick={(e)=>e.stopPropagation()}>
              <h2 style={styles.modalTitle}>Tạo phòng mới</h2>
              {/* Chọn chế độ chơi */}
              <label style={styles.label}>Chế độ chơi</label>
              <div style={styles.modeToggle}>
                {["pvp","pva"].map((m)=>(
                  <button
                    key={m}
                    style={createOpts.mode === m ? styles.modeActive : styles.modeInactive}
                    onClick={()=>setCreateOpts((p) => ({ ...p, mode: m }))}
                  >
                    {m==="pvp"?"Chơi với người":"Chơi với AI"}
                  </button>
                ))}
              </div>
              {/* Chọn màu */}
              <label style={styles.label}>Bạn đi quân màu</label>
              <div style={styles.modeToggle}>
                {["white","black"].map((c)=>(
                  <button
                    key={c}
                    style ={createOpts.host_color === c ? styles.modeActive : styles.modeInactive}
                    onClick={()=>setCreateOpts((p) => ({ ...p, host_color: c }))}
                  >
                    {c === "white"?"Quân trắng đi trước":"Quân đen đi sau"}
                  </button>
                ))}
              </div>
              {/* Giới hạn thời gian */}
              <label style={styles.label}>Giới hạn thời gian (giây, để trống = không giới hạn)</label>
              <input
                style={styles.input}
                type ="number"
                placeholder="VD: 300 (5 phút)"
                value={createOpts.time_limit}
                onChange={(e) => setCreateOpts((p) => ({ ...p, time_limit: e.target.value }))}
              />
              {/* Mật khẩu (chỉ pvp) */}
              {createOpts.mode === "pvp"&&(
                <>
                  <label style={styles.label}>Mật khẩu phòng (tuỳ chọn)</label>
                  <input
                    style ={styles.input}
                    type = "password"
                    placeholder="Để trông = phòng công khai"
                    value = {createOpts.password}
                    onChange={(e) => setCreateOpts((p) => ({ ...p, password: e.target.value }))}
                  />
                </>
              )}
              <div style={styles.modalActions}>
                <button style={styles.btnSecondary} onClick={()=>setShowCreate(false)}>Hủy</button>
                <button style={styles.btnPrimary} onClick={handleCreate} disabled={loading}>
                  {loading ? "Đang tạo..." : "Tạo phòng"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
  );
};
// styles 
const modeBadge = (mode) => ({
  display: "inline-block",
  padding: "2px 8px",
  borderRadius: 4,
  fontSize: 11,
  fontWeight: 700,
  background: mode === "pvp" ? "#3b82f6" : "#8b5cf6",
  color: "#fff",
});
const styles = {
  page: {
    minHeight: "100vh",
    background: "#0f172a",
    color: "#f1f5f9",
    padding: "32px 24px",
    fontFamily: "'Segoe UI', sans-serif",
    maxWidth: 860,
    margin: "0 auto",
  },
  header: { marginBottom: 32 },
  title: { fontSize: 32, fontWeight: 800, margin: 0, letterSpacing: -1 },
  subtitle:{ color: "#94a3b8", marginTop: 6 },
  actionBar:{
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    marginBottom: 32,
    alignItems: "center",
  },
  joinRow: { display: "flex", gap: 8, flex: 1, minWidth: 260 },
  input:{
    flex: 1,
    padding: "10px 14px",
    border: "1px solid #334155",
    background: "#1e293b",
    color: "#f1f5f9",
    fontSize: 14,
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  },
  btnPrimary:{
    padding: "10px 20px",
    borderRadius: 8,
    border: "none",
    background: "#3b82f6",
    color: "#fff",
    fontWeight: 700,
    fontSize: 14,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  btnSecondary:{
    padding: "10px 20px",
    borderRadius: 8,
    border: "1px solid #475569",
    background: "transparent",
    color: "#cbd5e1",
    fontWeight: 600,
    fontSize: 14,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  btnRefresh:{
    padding: "6px 14px",
    borderRadius: 6,
    border: "1px solid #475569",
    background: "transparent",
    color: "#94a3b8",
    cursor: "pointer",
    fontSize: 13,
  },
  section: { marginBottom: 32 },
  sectionHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 700, margin: 0 },
  empty: { color: "#475569", fontStyle: "italic", padding: "20px 0" },
  roomGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 12 },
  roomCard:{
    background: "#1e293b",
    borderRadius: 10,
    padding: "16px",
    border: "1px solid #334155",
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  roomMeta: { display: "flex", alignItems: "center", gap: 8 },
  host: { fontSize: 13, color: "#94a3b8" },
  timeLimit: { fontSize: 12, color: "#64748b" },
  btnJoin:{
    marginTop: 4,
    padding: "8px",
    borderRadius: 6,
    border: "none",
    background: "#22c55e",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: 13,
  },
  //Modal
  overlay:{
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modal:{
    background: "#1e293b",
    borderRadius: 14,
    padding: "28px 32px",
    width: "100%",
    maxWidth: 440,
    border: "1px solid #334155",
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },
  modalTitle: { margin: 0, fontSize: 22, fontWeight: 800 },
  label: { fontSize: 13, color: "#94a3b8", marginBottom: -6 },
  modeToggle: { display: "flex", gap: 8 },
  modeActive:{
    flex: 1,
    padding: "10px",
    borderRadius: 8,
    border: "2px solid #3b82f6",
    background: "#1d4ed8",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: 13,
  },
  modeInactive:{
    flex: 1,
    padding: "10px",
    borderRadius: 8,
    border: "1px solid #475569",
    background: "transparent",
    color: "#94a3b8",
    cursor: "pointer",
    fontSize: 13,
  },
  modalActions: { display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 },
}

export default OnlinePage;