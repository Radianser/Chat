import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { io, type Socket } from 'socket.io-client';
import { useUserStore } from '@src/stores/user/userStore';

type SocketType = Socket | null;
const SocketContext = createContext<SocketType>(null);

export function SocketProvider({ children }: { children: ReactNode }) {
    const currentUser = useUserStore((state) => state.state);
    const [socket, setSocket] = useState<SocketType>(null);
    

    useEffect(() => {
        if (!currentUser?.id) {
            if (socket) {
                socket.disconnect();
                setSocket(null);
            }
            return;
        }

        const newSocket = io('/', {
            auth: { userId: currentUser.id },
            autoConnect: true,
        });
        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [currentUser?.id]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
}

export function useSocket() {
    return useContext(SocketContext);
}