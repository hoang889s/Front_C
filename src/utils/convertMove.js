export const normallizeMove =(move)=>{
    // neu la object chuan
    if (move?.from && move?.to){
        return move;
    };
    //object co string ben trong
    if(move?.move && typeof move.move ==="string"){
        return{
            from:move.move.slice(0,2),
            to:move.move.slice(2,4)
        }

    };
    // string e2e4
    if(typeof move ==="string"&&move.length>=4){
        return{
            from:move.slice(0,2),
            to:move.slice(2,4),
        }
    };
    // fallback
    return{
        from:"?",
        to:"?",
    };
};