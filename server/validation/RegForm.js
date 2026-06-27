import bcrypt from 'bcrypt';
import User from '#models/User.js';

export default class RegFormValidation {
    constructor() {}

    async check({ email, password, confirm }) {
        const validated = {
            errors: {},
            checked: true
        };

        const email_check = await this.check_email(email);
        if (email_check !== true) {
            validated.errors.email = email_check;
            validated.checked = false;
            return validated;
        }
        validated.errors.email = null;

        const password_check = this.check_password(password);
        if (password_check !== true) {
            validated.errors.password = password_check;
            validated.checked = false;
            return validated;
        }
        validated.errors.password = null;

        const confirm_check = this.check_confirm(password, confirm);
        if (confirm_check !== true) {
            validated.errors.confirm = confirm_check;
            validated.checked = false;
            return validated;
        }
        validated.errors.confirm = null;


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
            if (!user) {
                return true;
            } else {
                return "Такой пользователь уже существует.";
            }
        } else {
            return "Неверный адрес электронной почты.";
        }
    }

    check_password(password) {
        if (!password || typeof password !== 'string') {
            return "Пароль не может быть пустым.";
        }

        if (password.length < 6) {
            return "Пароль должен быть не менее 6 символов.";
        }

        if (!password.match(/[a-z]/)) {
            return "Пароль должен содержать строчные буквы.";
        }

        if (!password.match(/[A-Z]/)) {
            return "Пароль должен содержать заглавные буквы.";
        }

        if (!password.match(/[0-9]/)) {
            return "Пароль должен содержать цифры.";
        }

        return true;
    }

    check_confirm(password, confirm) {
        if (password === confirm) {
            return true;
        } else {
            return "Пароль не подтвержден.";
        }
    }
}