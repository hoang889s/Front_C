import { useEffect,useState } from "react";
import {getRooms,createRoom,joinRoom,leaveRoom} from "../api/roomApi";
 

const OnlinePage = () => {
  const [rooms,setRooms] = useState([]);
  const [code, setCode] = useState("");
  const [myRoom,setMyRoom] = useState(null);
  useEffect(()=>{
    loadRooms();
  },[]);
  const loadRooms = async()=>{
    const data = await getRooms();
    setRooms(data.rooms||[]);
  }
  const handleCreate = async()=>{
    //e.preventDefault();
    try{
      const res = await createRoom({ mode: "pvp", host_color: "white" });
      console.log("Phòng mới tạo:", res);
      setMyRoom(res.room);
      loadRooms();
    }
    catch (err){
      console.error("Tạo phòng thất bại:", err.message);
      alert(err.message);
    }
  };
  const handleJoin = async()=>{
    if(!code.trim()){
      return alert("Nhập mã phòng");
    }
    try{
      const res = await joinRoom(code.trim());
      console.log("Vào phòng",res);
      setMyRoom(res.room);
      setCode("");
    }
    catch (err){
      console.error("Vào phòng thất bại:", err.message);
      alert(err.message);
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
  return (
      <div>
        <h1>Danh sách phòng</h1>
        {/* Hiện thông tin phòng đang ở + nút rời */}
        {myRoom ?(
          <div style={{border: "1px solid green", padding: 8, marginBottom: 12 }}>
            <strong>Đang ở phòng:{myRoom.mode}</strong>
            {" | "}Chế độ: {myRoom.mode}
            {" | "}Trạng thái: {myRoom.status}
            <button onClick={handleLeave} style={{ marginLeft: 12, color: "red" }}>Rời phòng</button>
          </div>
        ):(
          <div>
            <button type="button" onClick={handleCreate}>Tạo phòng</button>
            <div style={{ marginTop: 8 }}>
              <input
                placeholder="Nhập mã phòng"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
              <button onClick={handleJoin}>Vào phòng</button>
            </div>
          </div>
        )}
        <ul>
          {rooms.map((r)=>(
            <li key={r.id}>
              {r.code} — {r.mode} — {r.status}
            </li>
          ))}
        </ul>
      </div>
  );
};

export default OnlinePage;