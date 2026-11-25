import { useState, useEffect } from 'react';
import useTheme from '@src/hooks/useTheme.ts';
import { useUserStore } from '@src/stores/user/userStore';
import Authorization from '@pages/auth/Authorization';
import Registration from '@pages/auth/Registration';
import Chat from '@pages/chat/Chat';
import ChatList from '@pages/chat/ChatList';
import '@src/App.css';
import './style.css';
import { MobileContext } from '@src/context/mobileContext';
import { useSocket } from '@socket/SocketContext';

export default function Main() {
    const { theme, toggleTheme } = useTheme();
    const { getAuthUser, logoutUser } = useUserStore.getState();
    const currentUser = useUserStore((store) => store.state);
    const [auth, setAuth] = useState('auth');
    const [isLoading, setIsLoading] = useState(true);
    const [mobileErgonomic, setMobileErgonomic] = useState({
        windowWidth: window.innerWidth,
        isChatOpened: false
    });
    const socket = useSocket();

    useEffect(() => {
        const handleResize = () => {
            setMobileErgonomic(prev => ({
                ...prev,
                windowWidth: window.innerWidth
            }));
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const getUser = async () => {
            await getAuthUser();
            setIsLoading(false);
        };

        getUser();

        (window as any).user = currentUser;
        const unsubscribe = useUserStore.subscribe((newState) => {
            (window as any).user = newState.state;
        });
        
        return () => {
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
        if (socket) {
            socket.disconnect();
        }
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

    console.log('currentUser: ', currentUser);
    if (!currentUser.id) {
        return (
            <div className='chat-auth'>
                <title>Authentication</title>
                <meta name="description" content="Authentication page" />

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
            <title>Chat</title>
            <meta name="description" content="This is a web messenger" />

            <div className='chat-header'>
                <div>
                    <p>{currentUser.name}</p>
                </div>
                <div className={theme == 'dark' ? 'theme-switcher dark' : 'theme-switcher light'} onClick={() => toggleTheme()}></div>
                <div>
                    <a onClick={(e) => handleLogout(e)}>Log out</a>
                </div>
            </div>
            <div className='main-chat-page'>

                <MobileContext.Provider value={{ 
                    ergonomics: mobileErgonomic, 
                    setErgonomics: setMobileErgonomic 
                }}>
                    <ChatList/>
                    <Chat/>
                </MobileContext.Provider>

            </div>
        </div>
    )
}