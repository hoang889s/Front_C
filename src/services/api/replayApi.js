import http from "./http";

export const replayApi = {
    async getReplay(gameId) {
        const response = await http.get(
            `/game/games/${gameId}/replay`
        );
        console.log("[replayApi]",response.data)
        return response.data;
    },
    async downloadPGN(gameId){
        const response = await http.get(`/game/games/${gameId}/pgn`,
            {
                responseType: "blob",
            }
        );
        return response.data;
    },
    async exportPGN(gameId) {
        try{
            const blob = await this.downloadPGN(gameId);
            
            const url =window.URL.createObjectURL(
                 new Blob([blob], {
                    type: "application/x-chess-pgn",
                 })
            );
            const link = document.createElement("a");
            link.href = url;
            link.download = `game_${gameId}.pgn`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            console.log("[replayApi] PGN downloaded");
        }catch(error){
            console.error("[replayApi] download failed", error);
            throw error;
        }

    },
};