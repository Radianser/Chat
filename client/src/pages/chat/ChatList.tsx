import { useEffect } from "react";
import ChatSearch from '@pages/chat/ChatSearch.tsx';
import ChatItem from '@pages/chat/ChatItem.tsx';
import { useChatStore } from '@src/stores/chat/chatStore.ts';
import { useUserStore } from '@src/stores/user/userStore';
import { useSocket } from '@socket/SocketContext';
import './style.css';

export default function ChatList() {
    const { setUserChats, clearAllChats } = useChatStore.getState();
    const chatStore = useChatStore((store) => store.state);
    const userState = useUserStore((store) => store.state);
    const socket = useSocket();

    useEffect(() => {
        if (!socket || !userState.id) return;

        const getUserChats = ({ chats, errors }: { chats: any[], errors: string[] }) => {
            console.log('get_user_chats на клиенте:', chats, errors);
            setUserChats(chats);
        }

        socket.emit('get_user_chats', [userState.id]);
        socket.on('get_user_chats', getUserChats);

        return () => {
            socket.off('get_user_chats', getUserChats);
            clearAllChats();
        };
    }, [socket, userState.id]);

    return (
        <div className="chat-list-wrapper">
            <ChatSearch/>
            {
                chatStore.userChats.length > 0 && !chatStore.searchedChats.length && !chatStore.searchErrors.length
                    ?   <div className="chat-list">
                            {chatStore.userChats.map(chat => <ChatItem chat={chat} key={chat._id} />)}
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