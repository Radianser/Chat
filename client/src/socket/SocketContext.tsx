import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { io, type Socket } from 'socket.io-client';

type SocketType = Socket | null;
const SocketContext = createContext<SocketType>(null);

export function SocketProvider({ children }: { children: ReactNode }) {
    // useState, а не useRef — чтобы компоненты реагировали на изменение статуса
    const [socket, setSocket] = useState<SocketType>(null);

    useEffect(() => {
        // ВАЖНО: URL берём из env, а не хардкодим
        const newSocket = io(import.meta.env.VITE_WEB_SERVER_URL, {
            autoConnect: true,
        });
        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, []);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
}

export function useSocket() {
    return useContext(SocketContext);
}