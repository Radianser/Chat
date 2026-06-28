import { useUserStore } from '@src/stores/user/userStore';
import { useEffect, useState } from 'react';
import './style.css'

export default function Registration() {
    const { registrateUser, clearError, clearAllErrors } = useUserStore.getState();
    const errors = useUserStore((store) => store.state.errors);

    const [isSubmit, setIsSubmit] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        return clearAllErrors();
    }, []);

    async function handleSubmit(e: any) {
        e.preventDefault();
        const formData = new FormData(e.target);
        let response = await registrateUser(formData);

        if (response.validated) {
            setMessage(() => response.message);
            setIsSubmit(() => true);
        }
    }

    if (isSubmit) {
        return (
            <div className='reset-message'>
                {message}
            </div>
        );
    }

    return (
        <>
            <form onSubmit={handleSubmit} className="registration-form">
                <input
                    type="text"
                    name="name"
                    required
                    maxLength={100}
                    title="username"
                    placeholder="Username"
                />
                <input
                    type="email"
                    name="email"
                    required
                    maxLength={100}
                    title="username@site.com"
                    placeholder="Email"
                    onFocus={() => clearError('email')}
                    className={errors.email?.length ? 'input-error' : ''}
                />
                <input
                    type="password"
                    name="password"
                    required
                    minLength={6}
                    placeholder="Password"
                    title="Password should be at least of 6 characters, digits and etc."
                    onFocus={() => clearError('password')}
                    className={errors.password?.length ? 'input-error' : ''}
                />
                <input
                    type="password"
                    name="confirm"
                    required
                    minLength={6}
                    placeholder="Password confirmation"
                    title="Password confirmation"
                    onFocus={() => clearError('confirm')}
                    className={errors.confirm?.length ? 'input-error' : ''}
                />
                <button type="submit" className="form-submit font-semibold">Register</button>

                <div className='error-messages'>
                    {Object.entries(errors).map(([key, messages]) => (
                        messages.map((message, index) => (
                            <div key={`${key}-${index}`}>{message}</div>
                        ))
                    ))}
                </div>
            </form>
        </>
    );
}