import ChatUserInfo from '@src/pages/chat/ChatUserInfo.tsx';
import ChatInputs from '@src/pages/chat/ChatInputs.tsx';
import ChatMessages from '@src/pages/chat/ChatMessages.tsx';
import { useChatStore } from '@src/stores/chat/chatStore';
import { useEffect } from 'react';
import { useContext } from 'react';
import { MobileContext } from '@src/context/mobileContext';

export default function Chat() {
    const chatState = useChatStore((store) => store.state);
    const currentChat = chatState.currentChat;
    const context = useContext(MobileContext);
    if (!context) return null;
    const { ergonomics } = context;

    useEffect(() => {
        (window as any).chat = chatState;
        const unsubscribe = useChatStore.subscribe((newState) => {
            (window as any).chat = newState.state;
        });

        return () => {
            unsubscribe();
            delete (window as any).chat;
        };
    }, []);

    return (
        <div 
            className="chat-window-wrapper"
            style={ergonomics.isChatOpened ? { transform: 'translateX(0px)'} : {}}
        >
            {
                !Object.keys(currentChat).length
                    ?   <div className="chat-window-empty">
                            <span className="chat-intro">
                                Select a chat to start messaging
                            </span>
                        </div>
                    :   <div className="chat-window">
                           <ChatUserInfo/>
                           <ChatMessages/>
                           <ChatInputs/>
                        </div>
            }
        </div>
    );
}