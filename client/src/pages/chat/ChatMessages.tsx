import React, { useEffect, useRef } from 'react';
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
    const messageRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!socket) return;

        const getMessages = ({ messages, errors }: { messages: any[], errors: string[] }) => {
            setCurrentChatMessages(messages);

            if (!messageRef.current) return;
            messageRef.current.scrollTop = messageRef.current.scrollHeight;
        }
        socket.emit('get_messages', [currentChat._id]);
        socket.on('get_messages', getMessages);

        const newIncomingMessage = ({ message, errors }: { message: Record<string, any>, errors: string[] }) => {
            if (!currentChat._id && message.conversationId) {
                setCurrentChat({ ...currentChat, _id: message.conversationId });
            }

            if (!messageRef.current) return;
            const { scrollTop, scrollHeight, clientHeight } = messageRef.current;
            const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
            
            addNewMessageToList(message);
            updateChatList(message);

            if (isAtBottom) {
                requestAnimationFrame(() => {
                    if (!messageRef.current) return;
                    messageRef.current.scrollTop = messageRef.current.scrollHeight;
                });
            }
        }
        socket.on('new_incoming_message', newIncomingMessage);

        return () => {
            socket.off('get_messages', getMessages);
            socket.off('new_incoming_message', newIncomingMessage);
        };
    }, [socket, currentChat._id]);

    return (
        <div className="chat-messages" ref={messageRef}>
            {currentChatMessages.map((message:any, index:number) => {
                let date = new Date(message.updatedAt);
                let messageHTML = message.senderId == currentUser.id
                    ?   <div
                            className={
                                currentChatMessages[index - 1]?.senderId != message.senderId
                                    ?   "message right-side"
                                    :   "message right-side rounded"
                            }
                        >
                            <div>
                                <div>{message.text}</div>
                                <div className='message-info'>
                                    {
                                        message.updatedAt === message.createdAt
                                            ?   ''
                                            :   <div>edited</div>
                                    }
                                    <div>{date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</div>
                                    {
                                        message.status === 'sent'
                                            ?   <SentMarkIcon className="chat-list-seen-mark status-mark" />
                                            :   <SeenMarkIcon className="chat-list-sent-mark status-mark" />
                                    }
                                </div>
                            </div>
                            {
                                currentChatMessages[index - 1]?.senderId != message.senderId
                                    ?   <img src={chatImg + currentUser.img} alt="" />
                                    :   <span style={{width: '33px'}}></span>
                            }
                        </div>
                    :   <div
                            className={
                                currentChatMessages[index - 1]?.senderId != message.senderId
                                    ?   "message left-side"
                                    :   "message left-side rounded"
                            }
                        >
                            {
                                currentChatMessages[index - 1]?.senderId != message.senderId
                                    ?   <img src={chatImg + (currentChat.chatUsers[message.senderId].img 
                                            ?   currentChat.chatUsers[message.senderId].img 
                                            :   defaultChatImg)} alt="" 
                                        />
                                    :   <span style={{width: '33px'}}></span>
                            }
                            <div>
                                <div>{message.text}</div>
                                <div className='message-info'>
                                    {
                                        message.updatedAt === message.createdAt
                                            ?   ''
                                            :   <div>edited</div>
                                    }
                                    <div>{date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</div>
                                </div>
                            </div>
                        </div>

                let messageDateCurrent = (new Date(message.createdAt)).toLocaleDateString('en-EN', { day: '2-digit', month: 'long' });
                let messageDatePrev = (new Date(currentChatMessages[index - 1]?.createdAt)).toLocaleDateString('en-EN', { day: '2-digit', month: 'long' });
                let messageDateHTML = messageDatePrev != messageDateCurrent
                    ?   <div className="message date" key={`date-${message._id}`}>
                            {messageDateCurrent}
                        </div>
                    :   ''

                return <React.Fragment key={message._id}>
                        {messageDateHTML}
                        {messageHTML}
                    </React.Fragment>;
            })}
        </div>
    );
}