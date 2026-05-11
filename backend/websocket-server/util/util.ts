import type { Room } from '../types/types';

export const sendToPlayers = (room: Room, message: any, options: { excludeHost?: boolean, exclude?: any } = {}) => {
    const preparedMessage = JSON.stringify(message);

    if (!options.excludeHost && room.host_ws) {
        room.host_ws.send(preparedMessage);
    }

    room.players.forEach(player => {
        if (!options.exclude || player !== options.exclude) {
            player.send(preparedMessage);
        }
    });
}

export const executeForEachPlayer = (room: Room, callback: (player: any) => void, options: { excludeHost?: boolean, exclude?: any } = {}) => {
    if (!options.excludeHost && room.host_ws) {
        callback(room.host_ws);
    }
    
    room.players.forEach(player => {
        if (!options.exclude || player !== options.exclude) {
            callback(player);
        }
    });
}