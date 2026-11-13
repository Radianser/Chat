import { useChatStore } from '@src/stores/chat/chatStore';
import { useUserStore } from '@src/stores/user/userStore';
import SentMarkIcon from '@assets/checkMark.svg?react';
import SeenMarkIcon from '@assets/doneMark.svg?react';
import { useDateFormat } from '@hooks/useDateFormat';
import { useSocket } from '@socket/SocketContext';
import { useContext } from 'react';
import { MobileContext } from '@src/context/mobileContext';

export default function ChatItem({ chat }:any) {
    const currentUser = useUserStore((state) => state.state);
    const currentChat = useChatStore(store => store.state.currentChat);
    const setCurrentChat = useChatStore(store => store.setCurrentChat);
    const defaultChatImg = useChatStore(store => store.state.defaultChatImg);
    const { formatMessageDate } = useDateFormat();
    const socket = useSocket();

    const context = useContext(MobileContext);
    if (!context) return null;
    const { ergonomics, setErgonomics } = context;
    
    // let chatImg: string = import.meta.env.VITE_WEB_SERVER_URL;
    let chatImg: string = '';
    if (chat.type == 'direct') {
        let companionId = Object.keys(chat.chatUsers).find(id => String(id) !== String(currentUser.id)) as string;
        chatImg += (chat.chatUsers[companionId].img || defaultChatImg);
    } else {
        chatImg += (chat.chatImg ? chat.chatImg : defaultChatImg);
    }

    let chatTitle: string = chat.title;
    if (chat.type == 'direct') {
        let companionId = Object.keys(chat.chatUsers).find(id => String(id) !== String(currentUser.id)) as string;
        chatTitle = chat.chatUsers[companionId].name;
    }

    let isSelected: any = false;
    if (chat.type == 'direct') {
        // Находим ID собеседника в текущем выбранном чате
        const currentChatCompanionId = currentChat.chatUsers 
            ? Object.keys(currentChat.chatUsers).find(id => String(id) !== String(currentUser.id)) 
            : null;

        // Находим ID собеседника в чате из списка
        const chatCompanionId = chat.chatUsers 
            ? Object.keys(chat.chatUsers).find(id => String(id) !== String(currentUser.id)) 
            : null;

        isSelected = currentChatCompanionId && currentChatCompanionId === chatCompanionId;
    } else {
        isSelected = String(currentChat._id) === String(chat._id);
    }
    

    function handleClick(chat:Record<string, any>) {
        if (String(currentChat._id) === String(chat._id) || !socket) return;
        
        setCurrentChat(chat);
        socket.emit('join_chat', chat._id);

        if (ergonomics.windowWidth < Number(import.meta.env.VITE_MOBILE_DEVICE_WIDTH)) {
            setErgonomics(prev => ({
                ...prev,
                isChatOpened: true
            }));
        }
    }

    return (
        <div 
            className={isSelected ? 'chat-selected chat-list-info' : 'chat-list-info'} 
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
                            chat.lastMessageSender == currentUser.id
                                ? chat.lastMessageStatus == 'sent'
                                    ? <SentMarkIcon className="chat-list-seen-mark status-mark" />
                                    : <SeenMarkIcon className="chat-list-sent-mark status-mark" />
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