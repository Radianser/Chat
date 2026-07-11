import { useChatStore } from '@src/stores/chat/chatStore';
import SentMarkIcon from '@assets/checkMark.svg?react';
import SeenMarkIcon from '@assets/doneMark.svg?react';

export default function ChatItem({ chat }:any) {
    const currentChat = useChatStore(store => store.state.currentChat);
    const setCurrentChat = useChatStore(store => store.setCurrentChat);
    const defaultUserImg = useChatStore(store => store.state.defaultUserImg);
    const userImg = 'http://localhost:3000' + (chat.img ? chat.img : defaultUserImg);

    function handleClick(chat:any) {
        setCurrentChat(chat);
    }

    return (
        <div 
            className={currentChat.id == chat.id ? 'chat-selected chat-list-info' : 'chat-list-info'} 
            key={chat.id} 
            onClick={() => handleClick(chat)}
        >
            <img src={userImg} alt="" />
            <div>
                <div className="chat-list-user-info">
                    <div className="chat-list-user-name">
                        {chat.name}
                    </div>
                    <div className="chat-list-user-last-message" title={chat.message}>
                        {chat.message}
                    </div>
                </div>
                <div className="chat-list-message-info">
                    <div className="chat-list-message-status">
                        {
                            chat.messageType == 'outcome'
                                ? chat.messageStatus == 'delivered'
                                    ? <SeenMarkIcon className="chat-list-sent-mark" />
                                    : <SentMarkIcon className="chat-list-seen-mark" />
                                : ''
                        }
                    </div>
                    <div className="chat-list-message-time">
                        {chat.messageTime}
                    </div>
                </div>
            </div>
        </div>
    );
}