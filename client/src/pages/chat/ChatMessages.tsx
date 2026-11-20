import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '@socket/SocketContext';
import { useChatStore } from '@src/stores/chat/chatStore.ts';
import { useUserStore } from '@src/stores/user/userStore';
import SentMarkIcon from '@assets/checkMark.svg?react';
import SeenMarkIcon from '@assets/doneMark.svg?react';

export default function ChatMessages() {
    const currentUser = useUserStore((state) => state.state);
    const currentChat = useChatStore((store) => store.state.currentChat);
    const { 
        setCurrentChatMessages,
        addNewMessageToList,
        setCurrentChat,
        updateChatList
    } = useChatStore.getState();
    const socket = useSocket();
    const messagesWrapperRef = useRef<HTMLDivElement>(null);
    const [typingUsers, setTypingUsers] = useState<Record<string, any>[]>([]);
    const typingTimers = useRef<{ [key: string]: any }>({});

    useEffect(() => {
        if (!socket) return;

        setTypingUsers([]);
        Object.values(typingTimers.current).forEach(timer => clearTimeout(timer));
        typingTimers.current = {};

        socket.emit('get_messages', [currentChat._id]);

        const getMessages = ({ messages, errors }: { messages: any[], errors: string[] }) => {
            setCurrentChatMessages(messages);

            requestAnimationFrame(() => {
                if (!messagesWrapperRef.current) return;
                messagesWrapperRef.current.scrollTop = messagesWrapperRef.current.scrollHeight;
            });
        }
        socket.on('get_messages', getMessages);

        const newIncomingMessage = ({ message, errors }: { message: Record<string, any>, errors: string[] }) => {
            // если писать человеку, с которым еще нет чата
            if (!currentChat._id && message.conversationId) {
                setCurrentChat({ ...currentChat, _id: message.conversationId });
            }
            
            if (currentChat._id && String(message.conversationId) !== String(currentChat._id)) {
                // тут сделать логику с индикаторами непрочитанных сообщений
				return;
			}

            addNewMessageToList(message);
            updateChatList(message);

            setTypingUsers(prev => prev.filter(typingUser => typingUser.id !== message.senderId));
            if (typingTimers.current[message.senderId]) {
                clearTimeout(typingTimers.current[message.senderId]);
            }

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
        }
        socket.on('new_incoming_message', newIncomingMessage);

        const userTyping = (user: Record<string, any>) => {
            if (user.id == currentUser.id) return;

            let participant = useChatStore.getState().state.currentChat.participants.find((id: number) => Number(id) === Number(user.id));
            if (!participant) return;

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

        const messageUpdated = ({ updatedMessage, errors }: { updatedMessage: Record<string, any>, errors: string[] }) => {
            if (updatedMessage.conversationId != currentChat._id) return;

            const store = useChatStore.getState();
            const newMessagesList = store.state.currentChatMessages.map(message => 
                message._id === updatedMessage._id ? updatedMessage : message
            );
            
            store.setCurrentChatMessages(newMessagesList);
        }
        socket.on('message_updated', messageUpdated);

        return () => {
            socket.off('get_messages', getMessages);
            socket.off('new_incoming_message', newIncomingMessage);
            socket.off('user_typing', userTyping);
            socket.off('message_updated', messageUpdated);
        };
    }, [socket, currentChat._id]);

    return (
        <div className="chat-messages" ref={messagesWrapperRef}>
            {
                currentChat.type === 'direct'
                    ?   <DirectChat/>
                    :   <GroupChat/>
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

function DirectChat() {
    const currentChatMessages = useChatStore((store) => store.state.currentChatMessages);
    const defaultChatImg = useChatStore(store => store.state.defaultChatImg);
    const currentUser = useUserStore((state) => state.state);
    const currentChat = useChatStore((store) => store.state.currentChat);
    const socket = useSocket();
    const [editingMessage, setEditingMessage] = useState<Record<string, any>>({
        id: '',
        text: '',
        isEditing: false
    });

    if (!currentChatMessages.length) {
        return (
            <div className='no-messages-wrapper'>
                <div className='no-messages-text'>There are no messages yet</div>
            </div>
        );
    }

    const updateMessageOnEnter = (e: React.KeyboardEvent, message: Record<string, any>) => {
        if (e.code === 'Enter' && !e.shiftKey && !e.altKey && !e.ctrlKey) {
            e.preventDefault();
            
            socket?.emit('update_message', {
                ...message,
                text: editingMessage.text
            });

            setEditingMessage({
                id: '',
                text: '',
                isEditing: false
            });
        }
    }

    const updateMessage = (message: Record<string, any>) => {
        socket?.emit('update_message', {
            ...message,
            text: editingMessage.text
        });

        setEditingMessage({
            id: '',
            text: '',
            isEditing: false
        });
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
                                {
                                    editingMessage.isEditing && editingMessage.id == message._id
                                        ?   <input
                                                type="text"
                                                className='message-editing'
                                                value={editingMessage.text}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingMessage((prev: Record<string, any>) => ({
                                                        ...prev,
                                                        text: e.target.value
                                                    }))
                                                }
                                                onBlur={() => updateMessage(message)}
                                                onKeyUp={(e) => updateMessageOnEnter(e, message)}
                                                autoFocus
                                            />
                                        :   <div
                                                onClick={() => setEditingMessage({
                                                        id: message._id,
                                                        text: message.text,
                                                        isEditing: true
                                                    })
                                                }
                                            >
                                                {message.text}
                                            </div>
                                }
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

function GroupChat() {
    return (
        <></>
    )
}