import { useChatStore } from '@src/stores/chat/chatStore';

export default function ChatUserInfo({ chat }:any) {
    const defaultUserImg = useChatStore(store => store.state.defaultUserImg);
    const userImg = 'http://localhost:3000' + (chat.img ? chat.img : defaultUserImg);

    return (
        <div className="chat-user-info">
            <img src={userImg} alt="" />
            <div>
                <div className="chat-user-name">
                    {chat.name}
                </div>
                <div className="chat-user-status">
                    Online
                </div>
            </div>
        </div>
    );
}