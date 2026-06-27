import { useState, useEffect } from 'react'
// import reactLogo from '@assets/react.svg'
// import viteLogo from '@assets/vite.svg'
// import heroImg from '@assets/hero.png'
// import { Link } from 'react-router-dom'
import '@src/main.css'
import './style.css'
import { useUserStore } from '@src/stores/user/userStore';
import Authorization from '@pages/auth/Authorization';
import Registration from '@pages/auth/Registration';
import Chat from '@pages/chat/Chat';
import ChatList from '@pages/chat/ChatList';

// import 'bootstrap/dist/css/bootstrap.min.css'; // Импорт стилей
// import 'bootstrap'; // Импорт логики (JS)

export default function Main() {
    const { getAuthUser, resetUser, logoutUser } = useUserStore.getState(); // useUserStore.getState(); это ломает реактивность, так можно импортировать только функции
    const state = useUserStore((state) => state.state); // для сохранения реактивности при изменении state
    const [auth, setAuth] = useState('auth');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        getAuthUser().finally(() => {
            setIsLoading(false);
        });
        
        (window as any).user = state;
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

    if (state.id == 0) {
        return (
            <div className='chat-auth'>
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
            <div className='chat-header'>
                <div>
                    <p>{state.name}</p>
                </div>
                <div>
                    <a onClick={(e) => handleLogout(e)}>Log out</a>
                </div>
            </div>
            <div className='main-chat-page'>
                <ChatList/>
                <Chat/>
            </div>
        </div>
    )
}