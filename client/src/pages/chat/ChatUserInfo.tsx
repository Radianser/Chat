import { useChatStore } from '@src/stores/chat/chatStore';
import { useUserStore } from '@src/stores/user/userStore';
import { useContext } from 'react';
import { MobileContext } from '@src/context/mobileContext';

export default function ChatUserInfo() {
    const user = useUserStore((state) => state.state);
    const chat = useChatStore((store) => store.state.currentChat);
    const defaultChatImg = useChatStore(store => store.state.defaultChatImg);
    const clearCurrentChat = useChatStore(store => store.clearCurrentChat);
    const context = useContext(MobileContext);
    if (!context) return null;

    const { ergonomics, setErgonomics } = context;
    
    // let chatImg: string = import.meta.env.VITE_WEB_SERVER_URL;
    let chatImg: string = '';
    if (chat.type == 'direct') {
        // console.log('chat.chatUsers: ', chat.chatUsers);
        let companionId = Object.keys(chat.chatUsers).find(id => String(id) !== String(user.id)) as string;
        chatImg += (chat.chatUsers[companionId]?.img || defaultChatImg);
    } else {
        chatImg += (chat.chatImg ? chat.chatImg : defaultChatImg);
    }

    let chatTitle: string = chat.title;
    if (chat.type == 'direct') {
        let companionId = Object.keys(chat.chatUsers).find(id => String(id) !== String(user.id)) as string;
        chatTitle = chat.chatUsers[companionId].name
    }

    function handleClick() {
        if (ergonomics.windowWidth < Number(import.meta.env.VITE_MOBILE_DEVICE_WIDTH)) {
            setErgonomics(prev => ({
                ...prev,
                isChatOpened: false
            }));
            clearCurrentChat();
        }
    }

    return (
        <div className="chat-user-info">
            <button className="return-to-chats" onClick={() => handleClick()}>←</button>
            <img src={chatImg} alt="" />
            <div>
                <div className="chat-user-name">
                    {chatTitle}
                </div>
                <div className="chat-user-status">
                    Online
                </div>
            </div>
        </div>
    );
}