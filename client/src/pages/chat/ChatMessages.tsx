import { useEffect } from 'react';
import { useSocket } from '@socket/SocketContext';
import { useChatStore } from '@src/stores/chat/chatStore.ts';
import { useUserStore } from '@src/stores/user/userStore';

export default function ChatMessages() {
    const user = useUserStore((state) => state.state);
    const currentChat = useChatStore((store) => store.state.currentChat);
    const currentChatMessages = useChatStore((store) => store.state.currentChatMessages);
    const setCurrentChatMessages = useChatStore(store => store.setCurrentChatMessages);
    const addNewMessageToList = useChatStore(store => store.addNewMessageToList);
    const setCurrentChat = useChatStore(store => store.setCurrentChat);
    const socket = useSocket();

    useEffect(() => {
        if (!socket || !currentChat._id) return;

        const getMessages = ({ messages, errors }: { messages: any[], errors: string[] }) => {
            setCurrentChatMessages(messages);
        }
        socket.emit('get_messages', [currentChat._id]);
        socket.on('get_messages', getMessages);

        // не работает в новом чате
        const newIncomingMessage = (data:any) => {
            console.log('newIncomingMessage: ', data);
            
            // Берем актуальный чат из стора, а не из замыкания
            // const storeChat = useChatStore.getState().state.currentChat;
            
            // if (!storeChat._id && message.conversationId) {
            //     setCurrentChat({ ...storeChat, _id: message.conversationId });
            // }
            
            // addNewMessageToList(message);
        }
        socket.on('new_incoming_message', newIncomingMessage);

        return () => {
            socket.off('get_messages', getMessages);
            socket.off('new_incoming_message', newIncomingMessage);
        };
    }, [socket, currentChat._id]);

    // useEffect(() => {
    //     if (!socket || !currentChat._id) return;

    //     const newIncomingMessage = ({ message, errors }: { message: Record<string, any>, errors: string[] }) => {
    //         console.log('newIncomingMessage: ', message);
            
    //         // Берем актуальный чат из стора, а не из замыкания
    //         const storeChat = useChatStore.getState().state.currentChat;
            
    //         if (!storeChat._id && message.conversationId) {
    //             setCurrentChat({ ...storeChat, _id: message.conversationId });
    //         }
            
    //         addNewMessageToList(message);
    //     }
    //     socket.on('new_incoming_message', newIncomingMessage);

    //     return () => {
    //         socket.off('new_incoming_message', newIncomingMessage);
    //     };
    // }, [socket]);

    return (
        <div className="chat-messages">
            {currentChatMessages.map((message:any) => (
                message.senderId == user.id
                    ?   <div key={message._id} className="message right-side">
                            <div>{message.text}</div>
                        </div>
                    :   <div key={message._id} className="message left-side">
                            <div>{message.text}</div>
                        </div>
            ))}
        </div>
    );
}