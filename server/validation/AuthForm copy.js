import bcrypt from 'bcrypt';
import User from '#models/User.js';

export default class AuthFormValidation {
    #user = null;

    constructor() {}

    async check({ email, password }) {
        const validated = {
            errors: {},
            checked: true,
            user: null
        };

        const email_check = await this.check_email(email);
        if (email_check !== true) {
            validated.errors.email = email_check;
            validated.checked = false;
            return validated;
        }
        validated.errors.email = null;

        const password_check = await this.check_password(email, password);
        if (password_check !== true) {
            validated.errors.password = password_check;
            validated.checked = false;
            return validated;
        }
        validated.errors.password = null;
        validated.user = this.#user;

        return validated;
    }

    async check_email(email) {
        const match = email.match(/^[a-z0-9._-]+@[a-z0-9.-]+\.[a-z]{2,}$/i)
        const max_length = 100;

        if(match.length > 0) {
            if(match[0].length > max_length) {
                return "Максимальная длина email - 100 символов.";
            }

            const user = await (new User).findByEmail(match[0]);

            if (user) {
                if(user.verified_at) {
                    this.#user = user;
                    return true;
                } else {
                    return "Пользователь не подтвердил почту.";
                }
            } else {
                return "Такого пользователя не существует.";
            }
        } else {
            return "Неверный адрес электронной почты.";
        }
    }

    async check_password(email, password) {
        try {
            if (!this.#user) {
                throw new Error('Пользователь не найден.');
            }
            
            const match = await bcrypt.compare(password, this.#user.password);
            
            if (!match) {
                throw new Error('Неверный пароль.');
            }
            
            return true;
        } catch (error) {
            console.error('Ошибка проверки пароля:', error.message);
            return error.message;
        }
    }
}