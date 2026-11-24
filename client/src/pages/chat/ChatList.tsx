import { useEffect, useRef } from "react";
import ChatSearch from '@pages/chat/ChatSearch';
import ChatListItem from '@pages/chat/ChatListItem';
import { useChatStore } from '@src/stores/chat/chatStore';
import { useUserStore } from '@src/stores/user/userStore';
import { useSocket } from '@socket/SocketContext';
import './style.css';
import newMessageSound from '@assets/new_message.mp3';

export default function ChatList() {
    const currentUser = useUserStore((store) => store.state);
    const currentChat = useChatStore((store) => store.state.currentChat);
    const chatList = useChatStore((store) => store.state.chatList);
    const searchedChats = useChatStore((store) => store.state.searchedChats);
    const searchErrors = useChatStore((store) => store.state.searchErrors);
    const socket = useSocket();
    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        if (!socket || !currentUser.id) return;

        socket.emit('get_chat_list', [currentUser.id]);

        const getChatList = ({ chats, errors }: { chats: Record<string, any>[], errors: string[] }) => {
            if (errors.length) {
                console.log('errors: ', errors);
                return;
            }
            
            useChatStore.getState().setChatList(chats);
        }

        const newIncomingChat = ({ chat, errors }: { chat: Record<string, any>, errors: string[] }) => {
            if (errors.length) {
                console.log('errors: ', errors);
                return;
            }
            
            useChatStore.getState().addNewChat(chat);

            if (audioRef.current) {
                audioRef.current.play().catch(e => console.log("Автоплей заблокирован:", e));
            }
        }

        const newIncomingMessage = ({ message }: { message: Record<string, any> }) => {
            useChatStore.getState().updateChatList(message);

            if (
                audioRef.current &&
                message.conversationId !== currentChat._id &&
                message.senderId !== currentUser.id
            ) {
                audioRef.current.play().catch(e => console.log("Автоплей заблокирован:", e));
            }
        };

        const messageUpdated = ({ updatedMessage, errors }: { updatedMessage: Record<string, any>, errors: string[] }) => {
            if (errors.length) {
                console.log('errors: ', errors);
                return;
            }
            
            const findChat = useChatStore.getState().state.chatList.find(chat => String(chat._id) === String(updatedMessage.conversationId));
            
            if (findChat && findChat.lastMessageId === updatedMessage._id) {
                useChatStore.getState().updateChatLastMessage(updatedMessage);
            }
        }

        const messagesRead = ({ chatId, lastReadMessageId, errors }: { chatId: string, lastReadMessageId: string, errors: string[] }) => {
            if (errors.length) {
                console.log('errors: ', errors);
                return;
            }
            
            const newChatList = useChatStore.getState().state.chatList.map(chat => {
                if (
                    String(chat._id) === String(chatId) &&
                    String(chat.lastMessageId) === String(lastReadMessageId)
                ) {
                    return { ...chat, lastMessageStatus: 'read' }
                } else {
                    return chat;
                }
            });

            useChatStore.getState().updateChatLastMessageStatus(newChatList);
        }

        socket.on('get_chat_list', getChatList);
        socket.on('new_incoming_chat', newIncomingChat);
        socket.on('new_incoming_message', newIncomingMessage);
        socket.on('message_updated', messageUpdated);
        socket.on('messages_read', messagesRead);

        return () => {
            socket.off('get_chat_list', getChatList);
            socket.off('new_incoming_chat', newIncomingChat);
            socket.off('new_incoming_message', newIncomingMessage);
            socket.off('message_updated', messageUpdated);
            socket.off('messages_read', messagesRead);
            useChatStore.getState().clearAllChats();
        };
    }, [socket, currentUser.id, currentChat._id]);

    return (
        <div className="chat-list-wrapper">
            <audio src={newMessageSound} ref={audioRef}></audio>
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