import { useEffect } from "react";
import ChatSearch from '@pages/chat/ChatSearch.tsx';
import ChatItem from '@pages/chat/ChatItem.tsx';
import { useChatStore } from '@src/stores/chat/chatStore.ts';
import { useUserStore } from '@src/stores/user/userStore';
import { useSocket } from '@socket/SocketContext';
import './style.css';

export default function ChatList() {
    const { setChatList, clearAllChats } = useChatStore.getState();
    const chatStore = useChatStore((store) => store.state);
    const userState = useUserStore((store) => store.state);
    const socket = useSocket();

    useEffect(() => {
        if (!socket || !userState.id) return;

        const getChatList = ({ chats, errors }: { chats: any[], errors: string[] }) => {
            // console.log('get_chat_list на клиенте:', chats, errors);
            setChatList(chats);
        }

        socket.emit('get_chat_list', [userState.id]);
        socket.on('get_chat_list', getChatList);

        return () => {
            socket.off('get_chat_list', getChatList);
            clearAllChats();
        };
    }, [socket, userState.id]);

    return (
        <div className="chat-list-wrapper">
            <ChatSearch/>
            {
                chatStore.chatList.length > 0 && !chatStore.searchedChats.length && !chatStore.searchErrors.length
                    ?   <div className="chat-list">
                            {chatStore.chatList.map(chat => <ChatItem chat={chat} key={chat._id} />)}
                        </div>
                    :   chatStore.searchedChats.length > 0 && !chatStore.searchErrors.length
                            ?   <div className="chat-list">
                                    {chatStore.searchedChats.map(chat => <ChatItem chat={chat} key={chat._id} />)}
                                </div>
                            :   <div className="chat-list empty">
                                    No chats found
                                </div>
            }
        </div>
    );
}