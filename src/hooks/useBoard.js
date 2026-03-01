import {useState,useEffect} from "react";
import {fetchBoard} from "../api/boardApi";
const useBoard = () =>{
    const [board,setBoard] = useState([]);
    const [loading,setLoading] = useState(true);
    const [error,setError] = useState(null);
    useEffect(()=>{
        setLoading(true)
        fetchBoard()
            .then((data)=>setBoard(data))
            .catch((err)=>setError(err.message))
            .finally(()=>setLoading(false));
    },[]);
    return {board,loading,error};

};
export default useBoard;