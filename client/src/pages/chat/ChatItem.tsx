import checkMark from '@assets/checkMark.svg';
import doneMark from '@assets/doneMark.svg';

const defaultUserImg = 'http://localhost:3000/resources/1.png';

export default function ChatItem({ chat }:any) {
    return (
        <div className="chat-info" key={chat.id}>
            <img 
                src={
                        chat.img 
                        ? 'http://localhost:3000' + chat.img 
                        : defaultUserImg
                    } 
                alt="" 
            />
            <div>
                <div className="chat-user-info">
                    <div className="chat-user-name">
                        {chat.name}
                    </div>
                    <div className="chat-user-last-message">
                        {chat.message}
                    </div>
                </div>
                <div className="chat-message-info">
                    <div className="chat-message-status">
                        {
                            chat.messageType == 'outcome'
                                ? chat.messageStatus == 'delivered'
                                    ? <img src={doneMark} alt="" />
                                    : <img src={checkMark} alt="" />
                                : ''
                        }
                    </div>
                    <div className="chat-message-time">
                        {chat.messageTime}
                    </div>
                </div>
            </div>
        </div>
    );
}