import '@src/App.css'
import './style.css'
import { useUserStore } from '@src/stores/user/userStore';
import { useEffect, useState } from 'react';
import { useParams } from "react-router-dom";

export default function UserVerification() {
    const { id, token } = useParams<{ id: string; token: string }>();
    const { verifyToken, clearAllErrors } = useUserStore.getState();

    const [isExpired, setIsExpired] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const verifyUserToken = async () => {
            try {
                let response = await verifyToken({ user_id: Number(id), token });
                if (response.code === 'ERROR') {
                    setMessage(() => response.result);
                    setIsExpired(() => true);
                } else {
                    window.location.href = '/';
                }
            } catch (error) {
                console.error('Token verification failed:', error);
            }
        };
        verifyUserToken();
        
        return () => clearAllErrors();
    }, [id, token]);

    function handleGoBack() {
        clearAllErrors();
        window.location.href = '/';
    }

    return (
        <div className='chat-auth'>
            {
                !isExpired
                ?   <div className='loader-wrapper'>
                        <p>Проверка пользователя</p>
                        <span className="loader"></span>
                    </div>
                :   <div className='loader-wrapper'>
                        <p>{message}</p>
                        <button 
                            className="go-back-button"
                            onClick={handleGoBack}
                        >
                            Go back
                        </button>
                    </div>
            }
        </div>
    );
}