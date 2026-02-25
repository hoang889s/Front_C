import {useState,useEffect} from 'react';

const App = () =>{
  const [board,setBoard] = useState([]);
  useEffect(()=>{
    fetch("http://127.0.0.1:8000/board")
      .then(res=>res.json())
      .then(data=>setBoard(data))
      .catch(err=>console.error(err));
  },[]);
  if (!board || board.length === 0) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{display: "grid", gridTemplateColumns: "repeat(8, 60px)"}}>
      {board.flat().map((cell,index)=>(
        <div key={index} style={{width:"60px",
          height:"60px",
          border:"1px solid black",
          display:"flex",
          alignItems:"center",
          justifyContent:"center",
          fontSize:"24px",
        }}>
          {cell}
        </div>
      ))}
    </div>
  );
}

export default App
