import { useState, useEffect } from 'react';
import { useSocket } from '@socket/SocketContext';
import { useChatStore } from '@src/stores/chat/chatStore.ts';
import { useUserStore } from '@src/stores/user/userStore';

export default function ChatInputs() {
    const currentChat = useChatStore((store) => store.state.currentChat);
    const currentUser = useUserStore((state) => state.state);
    const socket = useSocket();
    const [message, setMessage] = useState('');

    const sendMessageOnEnter = (e: React.KeyboardEvent) => {
        if (e.code === 'Enter' && !e.shiftKey && !e.altKey && !e.ctrlKey) {
            e.preventDefault();
            sendMessage();
        }
    }

    function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
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
                    onChange={(e) => handleInput(e)}
                    onKeyUp={(e) => sendMessageOnEnter(e)}
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