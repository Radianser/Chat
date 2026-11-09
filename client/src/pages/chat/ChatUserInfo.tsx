import { useChatStore } from '@src/stores/chat/chatStore';
import { useUserStore } from '@src/stores/user/userStore';

export default function ChatUserInfo() {
    const user = useUserStore((state) => state.state);
    const chat = useChatStore((store) => store.state.currentChat);
    const defaultChatImg = useChatStore(store => store.state.defaultChatImg);
    
    let chatImg = import.meta.env.VITE_WEB_SERVER_URL;
    if (chat.type == 'direct') {
        console.log('chat.chatUsers: ', chat.chatUsers);
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

    return (
        <div className="chat-user-info">
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