import { useState, useEffect } from 'react';
import { useSocket } from '@socket/SocketContext';
import { useChatStore } from '@src/stores/chat/chatStore.ts';
import { useUserStore } from '@src/stores/user/userStore';

export default function ChatInputs() {
    const currentChat = useChatStore((store) => store.state.currentChat);
    const currentUser = useUserStore((state) => state.state);
    const socket = useSocket();
    const [message, setMessage] = useState('');

    // useEffect(() => {
    //     if (!socket) return;

    //     const getNewSentMessage = ({ messages, errors }: { messages: any[], errors: string[] }) => {
            
    //         console.log('get_new_sent_message на клиенте:', messages);
    //     }

    //     socket.on('get_new_sent_message', getNewSentMessage);

    //     return () => {
    //         socket.off('get_new_sent_message', getNewSentMessage);
    //     };
    // }, [socket]);

    function handleInput(e: any) {
        setMessage(() => e.target.value);
    }

    function sendMessage() {
        if (!message || !socket) return;

        socket.emit('send_new_message', {
            chatId: currentChat._id,
            senderId: currentUser.id,
            participants: Object.keys(currentChat.chatUsers).map(id => Number(id)),
            chatUsers: currentChat.chatUsers,
            type: 'text',
            text: message,
            status: 'sent',
            createdAt: new Date()
        });

        setMessage(() => '');
    }

    return (
        <div className="chat-inputs-wrapper">
            <div className="custom-input">
                <input 
                    value={message} 
                    onInput={(e) => handleInput(e)} 
                    type="text" 
                    className="chat-input" 
                    name="message" 
                    placeholder="Write a message"
                />
                <button 
                    onClick={() => sendMessage()} 
                    className="sendMessageButton"
                >→</button>
            </div>
        </div>
    );
}