import React, { useState } from "react";
import { createRoom, joinRoom, leaveRoom } from "../api/roomApi";

const OnlinePage = () => {
  const [roomCode, setRoomCode] = useState("");
  const [roomId, setRoomId] = useState(null);
  const [log, setLog] = useState("");
  const [form,setForm] = useState({
    name:"",
    is_private:false,
    password:"",
    mode:"human",
    time_limit:600,
    preferred_color:"random"
  })
  const handleCreate = async () => {
    const res = await createRoom(form);
    setLog(JSON.stringify(res, null, 2));
    if (res.success === false){
      return;
    }
    setRoomCode(res.room_code);
  };
  const handleJoin = async () => {
    const res = await joinRoom({code:roomCode});
    setLog(JSON.stringify(res, null, 2));

    if (res.success === false){
      return;
    };
    setRoomId(res.room_id);
  }
  const handleLeave = async () => {
    const res = await leaveRoom(roomId);
    setLog(JSON.stringify(res, null, 2));
  };
  return( 
    <div style={{padding: 20}}>
      <h2>Oline Room</h2>
      <div style={{border: "1px solid #ccc", padding: 15 }}>
        <h3>Tạo phòng</h3>
        <input
          placeholder="Tên phòng"
          value={form.name}
          onChange={(e)=>{
            setForm({ ...form, name: e.target.value })
          }}
        />
        <div>
          <label>
            <input
              type="checkbox"
              checked={form.is_private}
              onChange={(e) =>
                setForm({ ...form, is_private: e.target.checked })
              }
            />
            Phòng riêng
          </label>
        </div>
        {form.is_private && (
          <input
            type="password"
            placeholder="Mật khẩu"
            value={form.password}
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
          />
        )}
        <div>
          <label>Chế độ:</label>
          <select
            value={form.mode}
             onChange={(e) =>
              setForm({ ...form, mode: e.target.value })
            }
          >
            <option value="human">PvP</option>
            <option value="ai">AI</option>
          </select>
        </div>

        <div>
          <label>Thời gian:</label>
          <select
            value={form.time_limit}
            onChange={(e) =>
              setForm({
                ...form,
                time_limit: Number(e.target.value)
              })
            }
          >
            <option value={300}>5 phút</option>
            <option value={600}>10 phút</option>
            <option value={900}>15 phút</option>
          </select>
        </div>

        <div>
          <label>Màu:</label>
          <select
            value={form.preferred_color}
            onChange={(e) =>
              setForm({
                ...form,
                preferred_color: e.target.value
              })
            }
          >
            <option value="random">Ngẫu nhiên</option>
            <option value="white">Trắng</option>
            <option value="black">Đen</option>
          </select>
        </div>

        <button onClick={handleCreate}>Tạo phòng</button>
      </div>
      {/* JOIN ROOM */}
      <div style={{ marginTop: 20 }}>
        <h3>Vào phòng</h3>
        <input
          placeholder="Nhập room code"
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value)}
        />
        <button onClick={handleJoin}>Join</button>
      </div>
      {/* LEAVE */}
      <div style={{ marginTop: 20 }}>
          <button onClick={handleLeave}>Rời phòng</button>
      </div>
      {/* LOG */}
      <div style={{ marginTop: 20 }}>
        <h4>Log:</h4>
        <pre>{log}</pre>
      </div>
    </div>
  );
};
export default OnlinePage;
