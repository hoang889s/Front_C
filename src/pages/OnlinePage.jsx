import { useEffect,useState } from "react";
import {getRooms,createRoom,joinRoom,leaveRoom} from "../api/roomApi";
 

const OnlinePage = () => {
  const [rooms,setRooms] = useState([]);
  const [code, setCode] = useState("");
  useEffect(()=>{
    loadRooms();
  },[]);
  const loadRooms = async()=>{
    const data = await getRooms();
    setRooms(data.rooms||[]);
  }
  const handleCreate = async()=>{
    //e.preventDefault();
    const res = await createRoom({
      mode:"pvp",
      host_color:"white",
    });
    console.log(res);
    loadRooms();
  };
  const handleJoin = async()=>{
    const res = await joinRoom(code);
    console.log(res);
  };
  const handleLeave = async()=>{
    try{
      const data = await leaveRoom("ABC12345");
    }
    catch(err){
      console.error(err.message);
    }
  }
  return (
      <div>
        <h1>Danh sách phòng</h1>
        <button type="button" onClick={handleCreate}>Tạo phòng</button>
        <div>
          <input
            placeholder="Nhập mã phòng" value={code} onChange={(e)=>setCode(e.target.value)}
          />
          <button onClick={handleJoin}>Vào phòng</button>
        </div>
        <ul>
          {rooms.map((r)=>(
            <li key={r.id}>{r.code}</li>
          ))}
        </ul>
      </div>
  );
};

export default OnlinePage;