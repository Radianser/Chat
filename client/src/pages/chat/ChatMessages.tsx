import { useState, useEffect, useRef } from 'react';
import { useSocket } from '@socket/SocketContext';
import { useChatStore } from '@src/stores/chat/chatStore.ts';
import { useUserStore } from '@src/stores/user/userStore';
import ChatGroup from '@pages/chat/ChatGroup';
import ChatDirect from '@pages/chat/ChatDirect';

export default function ChatMessages() {
    const currentUser = useUserStore((state) => state.state);
    const currentChat = useChatStore((store) => store.state.currentChat);
    const currentChatMessages = useChatStore((store) => store.state.currentChatMessages);

    const socket = useSocket();
    const messagesWrapperRef = useRef<HTMLDivElement>(null);
    const [typingUsers, setTypingUsers] = useState<Record<string, any>[]>([]);
    const typingTimers = useRef<{ [key: string]: any }>({});

    const scrollToBottom = () => {
        if (!messagesWrapperRef.current) return;
        requestAnimationFrame(() => {
            setTimeout(() => {
                if (messagesWrapperRef.current) {
                    messagesWrapperRef.current.scrollTop = messagesWrapperRef.current.scrollHeight;
                }
            }, 0);
        });
    };

    const isAtBottom = () => {
        if (!messagesWrapperRef.current) return false;
        const { scrollTop, scrollHeight, clientHeight } = messagesWrapperRef.current;
        return scrollHeight - scrollTop - clientHeight < 50;
    };

    // socket.emit get_messages
    useEffect(() => {
        if (!socket || !currentChat._id) return;

        // Очистка при смене чата
        setTypingUsers([]);
        Object.values(typingTimers.current).forEach(clearTimeout);
        typingTimers.current = {};

        socket.emit('get_messages', [currentChat._id]);

        const getMessages = ({ messages }: { messages: any[] }) => {
            useChatStore.getState().setCurrentChatMessages(messages);
            scrollToBottom();
        };

        socket.on('get_messages', getMessages);

        return () => {
            socket.off('get_messages', getMessages)
        };
    }, [socket, currentChat._id]);

    // socket.on
    useEffect(() => {
        if (!socket) return;

        const newIncomingMessage = ({ message }: { message: Record<string, any> }) => {
            const store = useChatStore.getState();
            
            // Если это новый чат — обновляем currentChat
            if (!store.state.currentChat._id && message.conversationId) {
                store.setCurrentChat({ ...store.state.currentChat, _id: message.conversationId });
            }
            
            // Если сообщение из другого чата — игнорируем
            if (store.state.currentChat._id && String(message.conversationId) !== String(store.state.currentChat._id)) {
                return;
            }

            store.addNewMessageToList(message);
            store.updateChatList(message);

            // Очистка индикатора "печатает"
            setTypingUsers(prev => prev.filter(typingUser => typingUser.id !== message.senderId));
            if (typingTimers.current[message.senderId]) {
                clearTimeout(typingTimers.current[message.senderId]);
                delete typingTimers.current[message.senderId];
            }

            if (isAtBottom()) scrollToBottom();
        };

        const userTyping = (user: Record<string, any>) => {
            if (user.id == currentUser.id) return;

            const store = useChatStore.getState();
            const participant = store.state.currentChat.participants?.find((id: number) => Number(id) === Number(user.id));
            if (!participant) return;

            setTypingUsers(prev => {
                const exists = prev.find(typingUser => typingUser.id === user.id);
                return exists ? prev : [...prev, user];
            });

            if (typingTimers.current[user.id]) {
                clearTimeout(typingTimers.current[user.id])
            };
            typingTimers.current[user.id] = setTimeout(() => {
                setTypingUsers(prev => prev.filter(typingUser => typingUser.id !== user.id));
                delete typingTimers.current[user.id];
            }, 3000);

            if (isAtBottom()) scrollToBottom();
        };

        const messageUpdated = ({ updatedMessage }: { updatedMessage: Record<string, any> }) => {
            const store = useChatStore.getState();
            if (String(updatedMessage.conversationId) !== String(store.state.currentChat._id)) return;

            store.setCurrentChatMessages(
                store.state.currentChatMessages.map(message => 
                    String(message._id) === String(updatedMessage._id) ? updatedMessage : message
                )
            );
        };

        socket.on('new_incoming_message', newIncomingMessage);
        socket.on('user_typing', userTyping);
        socket.on('message_updated', messageUpdated);

        return () => {
            socket.off('new_incoming_message', newIncomingMessage);
            socket.off('user_typing', userTyping);
            socket.off('message_updated', messageUpdated);
        };
    }, [socket, currentUser.id]);

    // socket.emit mark_messages_as_read
    useEffect(() => {
        if (!socket || !currentChat._id) return;

        const markMessageAsRead = () => {
            const store = useChatStore.getState();
            const lastIncomingMessage = [...store.state.currentChatMessages]
                .reverse()
                .find(message => message.senderId !== currentUser.id);

            if (!lastIncomingMessage || lastIncomingMessage.status === 'read') return;

            socket.emit('mark_messages_as_read', {
                chatId: currentChat._id,
                lastReadMessageId: lastIncomingMessage._id,
                lastReadMessageCreatedAt: lastIncomingMessage.createdAt,
            });
        };

        const handleScroll = () => {
            if (isAtBottom()) markMessageAsRead();
        };

        messagesWrapperRef.current?.addEventListener('scroll', handleScroll);

        // Проверка при открытии (если сообщения помещаются на экране)
        if (messagesWrapperRef.current) {
            const { scrollHeight, clientHeight } = messagesWrapperRef.current;
            if (scrollHeight <= clientHeight) {
                markMessageAsRead()
            };
        }

        const messagesRead = ({ chatId, readerId, lastReadMessageId }: { chatId: string, readerId: number, lastReadMessageId: string }) => {
            if (String(currentChat._id) !== String(chatId)) return;
            
            const store = useChatStore.getState();
            const lastReadIndex = store.state.currentChatMessages.findIndex(message => String(message._id) === String(lastReadMessageId));
            if (lastReadIndex === -1) return;

            const newMessages = store.state.currentChatMessages.map((message, index) => {
                if (currentUser.id !== readerId && index <= lastReadIndex) {
                    return { ...message, status: 'read' };
                }
                return message;
            });
            
            store.setCurrentChatMessages(newMessages);
        };

        socket.on('messages_read', messagesRead);

        return () => {
            messagesWrapperRef.current?.removeEventListener('scroll', handleScroll);
            socket.off('messages_read', messagesRead);
        };
    }, [socket, currentChat._id, currentChatMessages.length]);

    return (
        <div className="chat-messages" ref={messagesWrapperRef}>
            { currentChat.type === 'direct' ? <ChatDirect/> : <ChatGroup/> }
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