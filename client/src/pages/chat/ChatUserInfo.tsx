import { useChatStore } from '@src/stores/chat/chatStore';
import { useUserStore } from '@src/stores/user/userStore';
import { useState, useEffect, useContext } from 'react';
import { MobileContext } from '@src/context/mobileContext';
import { useSocket } from '@socket/SocketContext';

export default function ChatUserInfo() {
    const currentUser = useUserStore((state) => state.state);
    const currentChat = useChatStore((store) => store.state.currentChat);
    const defaultChatImg = useChatStore(store => store.state.defaultChatImg);
    const clearCurrentChat = useChatStore(store => store.clearCurrentChat);
    const socket = useSocket();
    const [chatOnlineStatus, setChatOnlineStatus] = useState<string>('');
    const context = useContext(MobileContext);
    if (!context) return null;
    const { ergonomics, setErgonomics } = context;

    useEffect(() => {
        if (!socket) return;

        const companionsId = Object.keys(currentChat.chatUsers).filter(id => String(id) !== String(currentUser.id));
        
        const setUserOnlineStatus = (user: Record<string, any>) => {
            if (
                currentChat.type == 'direct' &&
                user.isOnline
            ) {
                setChatOnlineStatus(() => 'Online');
            } else if (
                currentChat.type == 'direct' &&
                !user.isOnline
            ) {
                setChatOnlineStatus(() => `${(new Date(user.lastSeen)).toLocaleDateString('en-EN', { 
                    hour: '2-digit',
                    minute: '2-digit',
                    day: '2-digit',
                    month: 'short',
                    // year: 'numeric'
                })}`);
            } else if (currentChat.type == 'group') {}
        }

        socket.emit('get_user_status', [...companionsId]);
        socket.on('user_status_received', setUserOnlineStatus)

        return () => {
            socket.off('user_status_received', setUserOnlineStatus)
        }
    }, [socket, currentChat._id]);
    
    let chatImg: string = '';
    if (currentChat.type == 'direct') {
        let companionId = Object.keys(currentChat.chatUsers).find(id => String(id) !== String(currentUser.id)) as string;
        chatImg += (currentChat.chatUsers[companionId]?.img || defaultChatImg);
    } else {
        chatImg += (currentChat.chatImg ? currentChat.chatImg : defaultChatImg);
    }

    let chatTitle: string = currentChat.title;
    if (currentChat.type == 'direct') {
        let companionId = Object.keys(currentChat.chatUsers).find(id => String(id) !== String(currentUser.id)) as string;
        chatTitle = currentChat.chatUsers[companionId].name
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