import { useUserStore } from '@src/stores/user/userStore';
import { useEffect } from 'react';
import './style.css'

export default function Registration() {
    const { registrateUser, clearError, clearAllErrors } = useUserStore.getState();
    const errors = useUserStore((store) => store.state.errors);

    useEffect(() => {
        return clearAllErrors();
    }, []);

    function handleSubmit(e: any) {
        e.preventDefault();
        const formData = new FormData(e.target);
        registrateUser(formData);
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
                    className={errors['email'] ? 'input-error' : ''}
                />
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
                <button type="submit" className="form-submit font-semibold">Register</button>
            </form>
        </>
    );
}