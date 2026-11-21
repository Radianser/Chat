import { useEffect } from "react";
import ChatSearch from '@pages/chat/ChatSearch';
import ChatListItem from '@pages/chat/ChatListItem';
import { useChatStore } from '@src/stores/chat/chatStore';
import { useUserStore } from '@src/stores/user/userStore';
import { useSocket } from '@socket/SocketContext';
import './style.css';

export default function ChatList() {
    const { 
        setChatList,
        clearAllChats,
        updateChatList,
        updateChatLastMessage,
        updateChatLastMessageStatus
    } = useChatStore.getState();
    const chatList = useChatStore((store) => store.state.chatList);
    const searchedChats = useChatStore((store) => store.state.searchedChats);
    const searchErrors = useChatStore((store) => store.state.searchErrors);
    const currentUser = useUserStore((store) => store.state);
    const socket = useSocket();

    useEffect(() => {
        if (!socket || !currentUser.id) return;

        socket.emit('get_chat_list', [currentUser.id]);

        const getChatList = ({ chats, errors }: { chats: any[], errors: string[] }) => {
            setChatList(chats);
        }
        socket.on('get_chat_list', getChatList);

        const newIncomingMessage = ({ message, errors }: { message: Record<string, any>, errors: string[] }) => {
            updateChatList(message);
        }
        socket.on('new_incoming_message', newIncomingMessage);

        const messageUpdated = ({ updatedMessage, errors }: { updatedMessage: Record<string, any>, errors: string[] }) => {
            const findChat = useChatStore.getState().state.chatList.find(chat => String(chat._id) === String(updatedMessage.conversationId));
            
            if (findChat && findChat.lastMessageId === updatedMessage._id) {
                updateChatLastMessage(updatedMessage);
            }
        }
        socket.on('message_updated', messageUpdated);

        return () => {
            socket.off('get_chat_list', getChatList);
            socket.off('new_incoming_message', newIncomingMessage);
            socket.off('message_updated', messageUpdated);
            clearAllChats();
        };
    }, [socket, currentUser.id]);

    useEffect(() => {
        if (!socket) return;

        const messagesRead = ({ chatId, readerId, lastReadMessageId }: { chatId: string, readerId: number, lastReadMessageId: string }) => {
            
            console.log('chatList: ', { chatId, readerId, lastReadMessageId });

            const newChatList = useChatStore.getState().state.chatList.map(chat => {
                if (
                    String(chat._id) === String(chatId) &&
                    String(chat.lastMessageId) === String(lastReadMessageId)
                ) {
                    return {
                        ...chat,
                        lastMessageStatus: 'read'
                    }
                } else {
                    return chat;
                }
            });

            updateChatLastMessageStatus(newChatList);
        }
        socket.on('messages_read', messagesRead);

        return () => {
            socket.off('messages_read', messagesRead);
        }
    }, [socket]);

    return (
        <div className="chat-list-wrapper">
            <ChatSearch/>
            {
                chatList.length > 0 && !searchedChats.length && !searchErrors.length
                    ?   <div className="chat-list">
                            {chatList.map(chat => <ChatListItem chat={chat} key={chat._id} />)}
                        </div>
                    :   searchedChats.length > 0 && !searchErrors.length
                            ?   <div className="chat-list">
                                    {searchedChats.map(chat => <ChatListItem chat={chat} key={chat._id} />)}
                                </div>
                            :   <div className="chat-list empty">
                                    No chats found
                                </div>
            }
        </div>
    );
}