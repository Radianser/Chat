import { useChatStore } from '@src/stores/chat/chatStore';
import checkMark from '@assets/checkMark.svg';
import doneMark from '@assets/doneMark.svg';

const defaultUserImg = 'http://localhost:3000/resources/1.png';

export default function ChatItem({ chat }:any) {
    const setCurrentChat = useChatStore(store => store.setCurrentChat);

    function handleClick(chat:any) {
        setCurrentChat(chat);
    }

    return (
        <div className="chat-list-info" key={chat.id} onClick={() => handleClick(chat)}>
            <img 
                src={
                        chat.img 
                        ? 'http://localhost:3000' + chat.img 
                        : defaultUserImg
                    } 
                alt="" 
            />
            <div>
                <div className="chat-list-user-info">
                    <div className="chat-list-user-name">
                        {chat.name}
                    </div>
                    <div className="chat-list-user-last-message">
                        {chat.message}
                    </div>
                </div>
                <div className="chat-list-message-info">
                    <div className="chat-list-message-status">
                        {
                            chat.messageType == 'outcome'
                                ? chat.messageStatus == 'delivered'
                                    ? <img src={doneMark} alt="" />
                                    : <img src={checkMark} alt="" />
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