import { useState, useEffect } from 'react';
import useTheme from '@src/hooks/useTheme.ts';
import { useUserStore } from '@src/stores/user/userStore';
import { useChatStore } from '@src/stores/chat/chatStore';
import Authorization from '@pages/auth/Authorization';
import Registration from '@pages/auth/Registration';
import Chat from '@pages/chat/Chat';
import ChatList from '@pages/chat/ChatList';
import '@src/App.css';
import './style.css';

// import 'bootstrap/dist/css/bootstrap.min.css'; // Импорт стилей
// import 'bootstrap'; // Импорт логики (JS)

// переименовать в welcome
export default function Main() {
    const { theme, toggleTheme } = useTheme();
    const { getAuthUser, resetUser, logoutUser } = useUserStore.getState(); // useUserStore.getState(); это ломает реактивность, так можно импортировать только функции
    const userState = useUserStore((store) => store.state); // для сохранения реактивности при изменении state
    const chatState = useChatStore((store) => store.state);
    const [auth, setAuth] = useState('auth');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        getAuthUser().finally(() => {
            setIsLoading(false);
        });
        
        (window as any).user = userState;
        const unsubscribe = useUserStore.subscribe((newState) => {
            (window as any).user = newState.state;
        });
        
        return () => {
            resetUser();
            unsubscribe();
            delete (window as any).user;
        };
    }, []);

    function handleClick(e: any, type: string) {
        e.preventDefault();
        setAuth(() => type);
    }

    function handleLogout(e: any) {
        e.preventDefault();
        logoutUser();
    }

    if (isLoading) {
        return (
            <div className='chat-auth'>
                <div className='loader-wrapper'>
                    <p>Loading</p>
                    <span className="loader"></span>
                </div>
            </div>
        );
    }

    if (!userState.id) {
        return (
            <div className='chat-auth'>
                <article>
                    <title>Authentication</title>
                    <meta name="description" content="Authentication page" />
                </article>

                <div className='auth-plate'>
                    <div className='auth-header-links'>
                        <a onClick={(e) => handleClick(e, 'auth')}>Authorization</a>
                        <a onClick={(e) => handleClick(e, 'reg')}>Registration</a>
                    </div>
                    
                    {auth == 'auth' ? <Authorization/> : <Registration/>}
                </div>
            </div>
        );
    }

    return (
        <div className='chat-app'>
            <article>
                <title>Chat</title>
                <meta name="description" content="This is a web messenger" />
            </article>

            <div className='chat-header'>
                <div>
                    <p>{userState.name}</p>
                </div>
                <div className={theme == 'dark' ? 'theme-switcher dark' : 'theme-switcher light'} onClick={() => toggleTheme()}></div>
                <div>
                    <a onClick={(e) => handleLogout(e)}>Log out</a>
                </div>
            </div>
            <div className='main-chat-page'>
                <ChatList/>
                <Chat user={chatState.currentChat} />
            </div>
        </div>
    )
}