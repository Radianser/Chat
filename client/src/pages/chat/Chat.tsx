import ChatUserInfo from '@src/pages/chat/ChatUserInfo.tsx';
import ChatInputs from '@src/pages/chat/ChatInputs.tsx';
import ChatMessages from '@src/pages/chat/ChatMessages.tsx';
import { useChatStore } from '@src/stores/chat/chatStore';
import { useUserStore } from '@src/stores/user/userStore';
import { useSocket } from '@socket/SocketContext';
import { useEffect } from 'react';

export default function Chat() {
    const user = useUserStore((state) => state.state);
    const chat = useChatStore((store) => store.state.currentChat);
    const socket = useSocket();

    useEffect(() => {
        if (!socket || !chat.id) return;

        const getLastMessages = ({ messages }: { messages: Array<any> }) => {
            console.log('get_last_messages на клиенте:', messages);
        }

        socket.emit('get_last_messages', [user.id, chat.id]);
        socket.on('get_last_messages', getLastMessages);

        return () => {
            socket.off('get_last_messages', getLastMessages);
        };
    }, [socket, chat.id]);

    return (
        <div className="chat-window-wrapper">
            {
                !Object.keys(chat).length
                    ?   <div className="chat-window-empty">
                            <span className="chat-intro">
                                Select a chat to start messaging
                            </span>
                        </div>
                    :   <div className="chat-window">
                           <ChatUserInfo chat={chat} />
                           <ChatMessages chat={chat} />
                           <ChatInputs chat={chat} />
                        </div>
            }
        </div>
    );
}