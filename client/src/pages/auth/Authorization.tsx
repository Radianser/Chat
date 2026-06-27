import { useUserStore } from '@src/stores/user/userStore';
import { useEffect } from 'react';
import './style.css'

export default function Authorization() {
    const { authorizeUser, clearError, clearAllErrors } = useUserStore.getState();
    const errors = useUserStore((store) => store.state.errors);

    useEffect(() => {
        return clearAllErrors();
    }, []);

    function handleSubmit(e: any) {
        e.preventDefault();
        const formData = new FormData(e.target);
        authorizeUser(formData);
    }

    return (
        <>
            <form onSubmit={handleSubmit} className="authorization-form">
                <input
                    type="email"
                    maxLength={101}
                    required
                    title="username@site.com"
                    name="email"
                    placeholder="Email"
                    onFocus={() => clearError('email')}
                    className={errors.email?.length ? 'input-error' : ''}
                />
                
                <input
                    type="password"
                    name="password"
                    required
                    placeholder="Password"
                    onFocus={() => clearError('password')}
                    className={errors.password?.length ? 'input-error' : ''}
                />
                <button type="submit" className="form-submit font-semibold">Enter</button>

                <div className='error-messages'>
                    {Object.entries(errors).map(([key, messages]) => (
                        messages.map((message, index) => (
                            <p key={`${key}-${index}`}>{message}</p>
                        ))
                    ))}
                </div>
            </form>
            <a href="/forgot-password" className="forgot-password-link">Забыли пароль?</a>
        </>
    );
}