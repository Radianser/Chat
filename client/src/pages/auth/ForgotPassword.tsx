import '@src/App.css'
import './style.css'
import { useUserStore } from '@src/stores/user/userStore';
import { useState } from 'react';

export default function ForgotPassword() {
    const { restorePassword, clearError } = useUserStore.getState();
    const errors = useUserStore((store) => store.state.errors);
    
    const [isSubmit, setIsSubmit] = useState(false);
    const [message, setMessage] = useState('');

    async function handleSubmit(e:any) {
        e.preventDefault();
        const formData = new FormData(e.target);
        let response = await restorePassword(formData);

        if (response.validated) {
            setMessage(() => response.message);
            setIsSubmit(() => true);
        }
    }

    if (isSubmit) {
        return (
            <div className='chat-auth'>
                <div className='auth-plate'>
                    <div className='auth-header-links'>
                        <p>Password restore</p>
                    </div>
                    <div className='reset-message'>
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
                    <p>Password restore</p>
                </div>
                
                <form onSubmit={handleSubmit} className="authorization-form">
                    <input
                        type="email"
                        name="email"
                        maxLength={100}
                        required
                        title="username@site.com"
                        placeholder="Email"
                        onFocus={() => clearError('email')}
                        className={errors.email?.length ? 'input-error' : ''}
                    />
                    <button type="submit" className="form-submit font-semibold">Restore</button>

                    <div className='error-messages'>
                        {Object.entries(errors).map(([key, messages]) => (
                            messages.map((message, index) => (
                                <div key={`${key}-${index}`}>{message}</div>
                            ))
                        ))}
                    </div>
                </form>
            </div>
        </div>
    );
}