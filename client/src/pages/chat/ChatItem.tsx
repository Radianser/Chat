import { useChatStore } from '@src/stores/chat/chatStore';
import { useUserStore } from '@src/stores/user/userStore';
import SentMarkIcon from '@assets/checkMark.svg?react';
import SeenMarkIcon from '@assets/doneMark.svg?react';
import { useDateFormat } from '@hooks/useDateFormat';

export default function ChatItem({ chat }:any) {
    const user = useUserStore((state) => state.state);
    const currentChat = useChatStore(store => store.state.currentChat);
    const setCurrentChat = useChatStore(store => store.setCurrentChat);
    const defaultChatImg = useChatStore(store => store.state.defaultChatImg);
    const { formatMessageDate } = useDateFormat();
    
    let chatImg = import.meta.env.VITE_WEB_SERVER_URL;
    if (chat.type == 'direct') {
        let companionId = Object.keys(chat.chatUsers).find(id => String(id) !== String(user.id)) as string;
        chatImg += (chat.chatUsers[companionId].img || defaultChatImg);
    } else {
        chatImg += (chat.chatImg ? chat.chatImg : defaultChatImg);
    }

    let chatTitle: string = chat.title;
    if (chat.type == 'direct') {
        let companionId = Object.keys(chat.chatUsers).find(id => String(id) !== String(user.id)) as string;
        chatTitle = chat.chatUsers[companionId].name
    }

    function handleClick(chat:any) {
        if (currentChat._id == chat._id) return;
        console.log('chat: ', chat);
        setCurrentChat(chat);
    }

    return (
        <div 
            className={currentChat._id == chat._id ? 'chat-selected chat-list-info' : 'chat-list-info'} 
            key={chat._id} 
            onClick={() => handleClick(chat)}
        >
            <img src={chatImg} alt="" />
            <div>
                <div className="chat-list-user-info">
                    <div className="chat-list-user-name">
                        {chatTitle}
                    </div>
                    <div className="chat-list-user-last-message" title={chat.lastMessage}>
                        {chat.lastMessage}
                    </div>
                </div>
                <div className="chat-list-message-info">
                    <div className="chat-list-message-status">
                        {
                            chat.lastMessageSender == user.id
                                ? chat.lastMessageStatus == 'read'
                                    ? <SeenMarkIcon className="chat-list-sent-mark" />
                                    : <SentMarkIcon className="chat-list-seen-mark" />
                                : ''
                        }
                    </div>
                    <div className="chat-list-message-time">
                        {formatMessageDate(chat.lastMessageCreatedAt)}
                    </div>
                </div>
            </div>
        </div>
    );
}