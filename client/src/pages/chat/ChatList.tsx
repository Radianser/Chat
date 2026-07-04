import { useEffect } from "react";
import ChatSearch from '@pages/chat/ChatSearch.tsx';
import ChatItem from '@pages/chat/ChatItem.tsx';
import { useChatStore } from '@src/stores/chat/chatStore.ts';
import './style.css';

export default function ChatList() {
    const { getUserChats, clearAllChats } = useChatStore.getState();
    const chatStore = useChatStore((store) => store.state);

    useEffect(() => {
        getUserChats();

        return () => clearAllChats();
    }, []);

    return (
        <div className="chat-list-wrapper">
            <ChatSearch/>
            {
                chatStore.userChats.length > 0 && !chatStore.searchedChats.length
                    ?   <div className="chat-list">
                            {chatStore.userChats.map(chat => <ChatItem chat={chat} key={chat.id} />)}
                        </div>
                    :   chatStore.searchedChats.length > 0
                            ?   <div className="chat-list">
                                    {chatStore.searchedChats.map(chat => <ChatItem chat={chat} key={chat.id} />)}
                                </div>
                            :   <div className="chat-list empty">
                                    There are no chats yet
                                </div>
            }
        </div>
    );
}