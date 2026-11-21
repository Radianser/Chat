import { useChatStore } from '@src/stores/chat/chatStore';
import { useUserStore } from '@src/stores/user/userStore';
import { useState, useEffect, useContext } from 'react';
import { MobileContext } from '@src/context/mobileContext';
import { useSocket } from '@socket/SocketContext';

export default function ChatUserInfo() {
    const user = useUserStore((state) => state.state);
    const chat = useChatStore((store) => store.state.currentChat);
    const defaultChatImg = useChatStore(store => store.state.defaultChatImg);
    const clearCurrentChat = useChatStore(store => store.clearCurrentChat);
    const context = useContext(MobileContext);
    if (!context) return null;
    const { ergonomics, setErgonomics } = context;
    const socket = useSocket();
    const [chatOnlineStatus, setChatOnlineStatus] = useState<string>('');

    useEffect(() => {
        if (!socket) return;

        const companionsId = Object.keys(chat.chatUsers).filter(id => String(id) !== String(user.id));
        console.log('companionsId: ', companionsId);
        
        const setUserOnlineStatus = (user: Record<string, any>) => {
            // console.log('setUserOnlineStatus: ', user); 8 раз выводится - разобраться

            if (
                chat.type == 'direct' &&
                user.isOnline
            ) {
                setChatOnlineStatus(() => 'Online');
            } else if (
                chat.type == 'direct' &&
                !user.isOnline
            ) {
                setChatOnlineStatus(() => `${(new Date(user.lastSeen)).toLocaleDateString('en-EN', { 
                    hour: '2-digit',
                    minute: '2-digit',
                    day: '2-digit',
                    month: 'short',
                    // year: 'numeric'
                })}`);
            } else if (chat.type == 'group') {

            }
        }

        socket.emit('get_user_status', [...companionsId]);
        socket.on('user_status_received', setUserOnlineStatus)

        return () => {
            socket.off('user_status_received', setUserOnlineStatus)
        }
    }, [socket, chat.chatUsers]);
    
    let chatImg: string = '';
    if (chat.type == 'direct') {
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
                    {chatOnlineStatus}
                </div>
            </div>
        </div>
    );
}