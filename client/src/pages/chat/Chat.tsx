import ChatUserInfo from '@src/pages/chat/ChatUserInfo.tsx';
import ChatInputs from '@src/pages/chat/ChatInputs.tsx';
import ChatMessages from '@src/pages/chat/ChatMessages.tsx';
import { useSocket } from '@socket/SocketContext';
import { useEffect } from 'react';

export default function Chat({ user }:any) {
    const socket = useSocket();

    useEffect(() => {
        if (!socket) return;

        socket.on('connect', () => console.log('🟢 connect', socket.id));
        socket.on('connect_error', (e) => {
            console.log('🔴 Socket.IO connection error: ', e);
        });

        const onUserConnect = ({ id }: { id: string }) => {
            console.log('Пользователь подключился:', id);
        };

        const onUserDisconnect = ({ id }: { id: string }) => {
            console.log('Пользователь отключился:', id);
        };

        socket.on('user_connect', onUserConnect);
        socket.on('user_disconnect', onUserDisconnect);

        return () => {
            socket.off('user_connect', onUserConnect);
            socket.off('user_disconnect', onUserDisconnect);
        };
    }, [socket]);

    return (
        <div className="chat-window-wrapper">
            {
                !Object.keys(user).length
                    ?   <div className="chat-window-empty">
                            <span className="chat-intro">
                                Select a chat to start messaging
                            </span>
                        </div>
                    :   <div className="chat-window">
                           <ChatUserInfo user={user} />
                           <ChatMessages/>
                           <ChatInputs/>
                        </div>
            }
        </div>
    );
}