import React, { useState, useEffect, useRef } from 'react';
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
    const defaultChatImg = useChatStore(store => store.state.defaultChatImg);
    const messagesWrapperRef = useRef<HTMLDivElement>(null);
    const [typingUsers, setTypingUsers] = useState<Record<string, any>[]>([]);
    const typingTimers = useRef<{ [key: string]: any }>({});

    useEffect(() => {
        if (!socket) return;

        const getMessages = ({ messages, errors }: { messages: any[], errors: string[] }) => {
            setCurrentChatMessages(messages);

            requestAnimationFrame(() => {
                if (!messagesWrapperRef.current) return;
                messagesWrapperRef.current.scrollTop = messagesWrapperRef.current.scrollHeight;
            });
        }
        socket.emit('get_messages', [currentChat._id]);
        socket.on('get_messages', getMessages);

        const newIncomingMessage = ({ message, errors }: { message: Record<string, any>, errors: string[] }) => {
            if (!currentChat._id && message.conversationId) {
                setCurrentChat({ ...currentChat, _id: message.conversationId });
            }

            if (!messagesWrapperRef.current) return;
            const { scrollTop, scrollHeight, clientHeight } = messagesWrapperRef.current;
            const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
            
            addNewMessageToList(message);
            updateChatList(message);

            if (isAtBottom) {
                requestAnimationFrame(() => {
                    setTimeout(() => {
                        if (messagesWrapperRef.current) {
                            messagesWrapperRef.current.scrollTop = messagesWrapperRef.current.scrollHeight;
                        }
                    }, 0);
                });
            }
        }
        socket.on('new_incoming_message', newIncomingMessage);

        const userTyping = (user: Record<string, any>) => {
            if (user.id == currentUser.id) return;

            setTypingUsers(prev => {
                const exists = prev.find(typingUser => typingUser.id === user.id);
                return exists ? prev : [...prev, user];
            });

            if (!messagesWrapperRef.current) return;
            const { scrollTop, scrollHeight, clientHeight } = messagesWrapperRef.current;
            const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;

            if (isAtBottom) {
                requestAnimationFrame(() => {
                    setTimeout(() => {
                        if (messagesWrapperRef.current) {
                            messagesWrapperRef.current.scrollTop = messagesWrapperRef.current.scrollHeight;
                        }
                    }, 0);
                });
            }

            if (typingTimers.current[user.id]) {
                clearTimeout(typingTimers.current[user.id]);
            }

            typingTimers.current[user.id] = setTimeout(() => {
                setTypingUsers(prev => prev.filter(typingUser => typingUser.id !== user.id));
            }, 3000);
        }
        socket.on('user_typing', userTyping);

        return () => {
            socket.off('get_messages', getMessages);
            socket.off('new_incoming_message', newIncomingMessage);
            socket.off('user_typing', userTyping);
        };
    }, [socket, currentChat._id]);

    return (
        <div className="chat-messages" ref={messagesWrapperRef}>
            {
                currentChat.type === 'direct'
                    ?   directChat(currentChatMessages, currentChat, currentUser, defaultChatImg)
                    :   groupChat()
            }
            {
                typingUsers.length === 1
                    ?   <div className='typing-indicator'>
                            <div>
                                {typingUsers.map((user: Record<string, any>) => `${user.name} is typing`)}
                            </div>
                            <div className='typing-indicator-points-wrapper'>
                                <div className='typing-indicator-points'></div>
                                <div className='typing-indicator-points'></div>
                                <div className='typing-indicator-points'></div>
                            </div>
                        </div>
                    :   typingUsers.length > 1
                        ?   <div className='typing-indicator'>
                                <div>
                                    {
                                        typingUsers.map((user: Record<string, any>, index: number) => {
                                            if (index === 0) {
                                                return user.name;
                                            } else {
                                                return `, ${user.name}`;
                                            }
                                        })
                                    } are typing
                                </div>
                                <div className='typing-indicator-points-wrapper'>
                                    <div className='typing-indicator-points'></div>
                                    <div className='typing-indicator-points'></div>
                                    <div className='typing-indicator-points'></div>
                                </div>
                            </div>
                        :   ''
            }
        </div>
    );
}

function directChat(currentChatMessages: Array<any>, currentChat: Record<string, any>, currentUser: Record<string, any>, defaultChatImg: string) {
    if (!currentChatMessages.length) {
        return (
            <div className='no-messages-wrapper'>
                <div className='no-messages-text'>There are no messages yet</div>
            </div>
        );
    }
    
    return (
        <>
            {currentChatMessages.map((message:any, index:number) => {
                let messageDateCurrent = (new Date(message.createdAt)).toLocaleDateString('en-EN', { day: '2-digit', month: 'long' });
                let messageDatePrev = (new Date(currentChatMessages[index - 1]?.createdAt)).toLocaleDateString('en-EN', { day: '2-digit', month: 'long' });
                let messageDateHTML = messageDatePrev != messageDateCurrent
                    ?   <div className="message date" key={`date-${message._id}`}>
                            {messageDateCurrent}
                        </div>
                    :   ''

                let date = new Date(message.updatedAt);
                let messageHTML = message.senderId == currentUser.id
                    ?   <div
                            className={
                                currentChatMessages[index - 1]?.senderId != message.senderId || messageDatePrev != messageDateCurrent
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
                                currentChatMessages[index - 1]?.senderId != message.senderId || messageDatePrev != messageDateCurrent
                                    ?   <img src={currentUser.img} alt="" />
                                    :   <span style={{width: '33px'}}></span>
                            }
                        </div>
                    :   <div
                            className={
                                currentChatMessages[index - 1]?.senderId != message.senderId || messageDatePrev != messageDateCurrent
                                    ?   "message left-side"
                                    :   "message left-side rounded"
                            }
                        >
                            {
                                currentChatMessages[index - 1]?.senderId != message.senderId || messageDatePrev != messageDateCurrent
                                    ?   <img src={currentChat.chatUsers[message.senderId].img 
                                            ?   currentChat.chatUsers[message.senderId].img 
                                            :   defaultChatImg} alt="" 
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

                return <React.Fragment key={message._id}>
                        {messageDateHTML}
                        {messageHTML}
                    </React.Fragment>;
            })}
        </>
    )
}

function groupChat() {
    return (
        <></>
    )
}