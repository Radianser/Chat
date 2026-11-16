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
        
        const setUserOnlineStatus = (data:any) => {
            console.log('setUserOnlineStatus: ', data);

            if (
                chat.type == 'direct' &&
                data.isOnline
            ) {
                setChatOnlineStatus(() => 'Online');
            } else if (
                chat.type == 'direct' &&
                !data.isOnline
            ) {
                setChatOnlineStatus(() => `Last seen at: ${(new Date(data.lastSeen)).toLocaleDateString('en-EN', { 
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                })}`);
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