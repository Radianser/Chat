import { useEffect } from 'react';
import { useSocket } from '@socket/SocketContext';
import { useChatStore } from '@src/stores/chat/chatStore.ts';
import { useUserStore } from '@src/stores/user/userStore';

export default function ChatMessages() {
    const user = useUserStore((state) => state.state);
    const currentChat = useChatStore((store) => store.state.currentChat);
    const currentChatMessages = useChatStore((store) => store.state.currentChatMessages);
    const setCurrentChatMessages = useChatStore(store => store.setCurrentChatMessages);
    const socket = useSocket();

    useEffect(() => {
            if (!socket || !currentChat._id) return;
    
            const getMessages = ({ messages, errors }: { messages: any[], errors: string[] }) => {
                setCurrentChatMessages(messages);

                console.log('get_messages на клиенте:', messages);
            }
    
            socket.emit('get_messages', [currentChat._id]);
            socket.on('get_messages', getMessages);
    
            return () => {
                socket.off('get_messages', getMessages);
            };
        }, [socket, currentChat._id]);

    return (
        <div className="chat-messages">
            {currentChatMessages.map((message:any) => (
                message.senderId == user.id
                    ?   <div key={message._id} className="message right-side">
                            {message.text}
                        </div>
                    :   <div key={message._id} className="message left-side">
                            {message.text}
                        </div>
            ))}
        </div>
    );
}