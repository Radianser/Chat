import { useEffect } from 'react';
import { useSocket } from './SocketContext';

export function useSocketEvent(event:any, handler:any) {
    const socket = useSocket();

    useEffect(() => {
        if (!socket) return;

        socket.on(event, handler);
        return () => {
            socket.off(event, handler);
        };
        // handler в зависимостях — обязательно, если он может меняться
        // (например, замыкает state). Если handler стабилен — можно не указывать.
    }, [socket, event, handler]);
}