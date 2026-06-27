import '@src/main.css'
import './style.css'
import { useUserStore } from '@src/stores/user/userStore';
import { useEffect, useState } from 'react';
import { useLoaderData } from "react-router-dom";

export default function ChangePassword() {
    const { id, token } = useLoaderData();
    const { changePassword, verifyToken, clearError, clearAllErrors } = useUserStore.getState();
    const errors = useUserStore((store) => store.state.errors);

    const [isExpired, setIsExpired] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const verifyUserToken = async () => {
            try {
                let response = await verifyToken({ user_id: Number(id), token });
                if (response.code === 'ERROR') {
                    setMessage(() => response.message);
                    setIsExpired(() => true);
                }
            } catch (error) {
                console.error('Token verification failed:', error);
            }
        };
        verifyUserToken();
        
        return () => clearAllErrors();
    }, [id, token]);

    async function handleSubmit(e:any) {
        e.preventDefault();
        const formData = new FormData(e.target);
        let response = await changePassword(formData);

        console.log('response.validated: ', response.validated);

        if (response.validated) {
            clearAllErrors();

            console.log(11111);
            window.location.href = '/';
        }
    }

    if (isExpired) {
        return (
            <div className='chat-auth'>
                <div className='auth-plate'>
                    <div className='auth-header-links'>
                        <p>Password restore</p>
                    </div>
                    <div className='verify-token-message'>
                        {message}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className='chat-auth'>
            <div className='auth-plate'>
                <div className='auth-header-links'>
                    <p>Change password</p>
                </div>
                
                <form onSubmit={handleSubmit} className="authorization-form">
                    <input
                        type="password"
                        name="password"
                        required
                        minLength={6}
                        placeholder="Password"
                        title="Password should be at least of 6 characters, digits and etc."
                        onFocus={() => clearError('password')}
                        className={errors['password'] ? 'input-error' : ''}
                    />
                    <input
                        type="password"
                        name="confirm"
                        required
                        minLength={6}
                        placeholder="Password confirmation"
                        title="Password confirmation"
                        onFocus={() => clearError('confirm')}
                        className={errors['confirm'] ? 'input-error' : ''}
                    />
                    <input
                        type='hidden'
                        name="id"
                        value={id}
                    />
                    <button type="submit" className="form-submit font-semibold">Submit</button>

                    <div className='error-messages'>
                        {Object.keys(errors).map((key, index) => (
                            <p key={index}>{errors[key]}</p>
                        ))}
                    </div>
                </form>
            </div>
        </div>
    );
}