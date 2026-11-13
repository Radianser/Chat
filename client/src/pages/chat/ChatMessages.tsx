import { useEffect } from 'react';
import { useSocket } from '@socket/SocketContext';
import { useChatStore } from '@src/stores/chat/chatStore.ts';
import { useUserStore } from '@src/stores/user/userStore';
import SentMarkIcon from '@assets/checkMark.svg?react';
import SeenMarkIcon from '@assets/doneMark.svg?react';

export default function ChatMessages() {
    const currentUser = useUserStore((state) => state.state);
    const currentChat = useChatStore((store) => store.state.currentChat);
    const currentChatMessages = useChatStore((store) => store.state.currentChatMessages);
    const setCurrentChatMessages = useChatStore(store => store.setCurrentChatMessages);
    const addNewMessageToList = useChatStore(store => store.addNewMessageToList);
    const setCurrentChat = useChatStore(store => store.setCurrentChat);
    const updateChatList = useChatStore(store => store.updateChatList);
    const socket = useSocket();
    // let chatImg = import.meta.env.VITE_WEB_SERVER_URL;
    let chatImg: string = '';
    const defaultChatImg = useChatStore(store => store.state.defaultChatImg);

    useEffect(() => {
        if (!socket) return;

        const getMessages = ({ messages, errors }: { messages: any[], errors: string[] }) => {
            setCurrentChatMessages(messages);
        }
        socket.emit('get_messages', [currentChat._id]);
        socket.on('get_messages', getMessages);

        const newIncomingMessage = ({ message, errors }: { message: Record<string, any>, errors: string[] }) => {
            if (!currentChat._id && message.conversationId) {
                setCurrentChat({ ...currentChat, _id: message.conversationId });
            }
            
            addNewMessageToList(message);
            updateChatList(message);
        }
        socket.on('new_incoming_message', newIncomingMessage);

        return () => {
            socket.off('get_messages', getMessages);
            socket.off('new_incoming_message', newIncomingMessage);
        };
    }, [socket, currentChat._id]);

    return (
        <div className="chat-messages">
            {currentChatMessages.map((message:any) => {
                let date = new Date(message.updatedAt);
                let div = message.senderId == currentUser.id
                    ?   <div key={message._id} className="message right-side">
                            <div>
                                <div>{message.text}</div>
                                <div className='message-info'>
                                    {
                                        message.updatedAt === message.createdAt
                                            ? ''
                                            : <div>edited</div>
                                    }
                                    <div>{date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</div>
                                    {
                                        message.status === 'sent'
                                            ? <SentMarkIcon className="chat-list-seen-mark status-mark" />
                                            : <SeenMarkIcon className="chat-list-sent-mark status-mark" />
                                    }
                                </div>
                            </div>
                            <img src={chatImg + currentUser.img} alt="" />
                        </div>
                    :   <div key={message._id} className="message left-side">
                            <img src={chatImg + (currentChat.chatUsers[message.senderId].img 
                                ? currentChat.chatUsers[message.senderId].img 
                                : defaultChatImg)} alt="" 
                            />
                            <div>
                                <div>{message.text}</div>
                                <div className='message-info'>
                                    {
                                        message.updatedAt === message.createdAt
                                            ? ''
                                            : <div>edited</div>
                                    }
                                    <div>{date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</div>
                                </div>
                            </div>
                        </div>
                return div;
            })}
        </div>
    );
}