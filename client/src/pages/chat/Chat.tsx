import UserChatInfo from '@src/pages/user/UserChatInfo.tsx';
import ChatInputs from '@src/pages/chat/ChatInputs.tsx';
import ChatMessages from '@src/pages/chat/ChatMessages.tsx';

export default function Chat({ user }:any) {
    return (
        <div className="chat-window-wrapper">
            {
                !Object.keys(user).length
                    ?   <div className="chat-window-empty">
                            <span className="chat-intro">
                                Select a chat to start messaging
                            </span>
                        </div>
                    :   <div className="chat-window">
                           <UserChatInfo user={user} />
                           <ChatMessages/>
                           <ChatInputs/>
                        </div>
            }
        </div>
    );
}