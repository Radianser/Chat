import bcrypt from 'bcrypt';
import User from '#models/User.js';

export default class FieldsValidation {
    #user = null;

    constructor() {}

    async check_email_auth(email) {
        const match = email.match(/^[a-z0-9._-]+@[a-z0-9.-]+\.[a-z]{2,}$/i)
        const max_length = 100;
        const validated = {
            user: this.#user,
            email: {
                success: false,
                value: null,
            },
            errors: []
        };

        if(match?.length > 0) {
            if(match[0].length > max_length) {
                validated.errors.push("Максимальная длина email - 100 символов.");
            }

            const user = await (new User).findByEmail(match[0]);

            if (user) {
                if(user.verified_at) {
                    this.#user = user;
                    validated.email.success = true;
                    validated.email.value = user.email;
                } else {
                    validated.errors.push("Пользователь не подтвердил почту.");
                }
            } else {
                validated.errors.push("Такого пользователя не существует.");
            }
        } else {
            validated.errors.push("Неверный адрес электронной почты.");
        }

        return validated;
    }

    async check_email_reg(email) {
        const match = email.match(/^[a-z0-9._-]+@[a-z0-9.-]+\.[a-z]{2,}$/i)
        const max_length = 100;
        const validated = {
            user: this.#user,
            email: {
                success: false,
                value: null,
            },
            errors: []
        };

        if(match?.length > 0) {
            if(match[0].length > max_length) {
                validated.errors.push("Максимальная длина email - 100 символов.");
            }
            
            const user = await (new User).findByEmail(match[0]);

            if (!user) {
                validated.email.success = true;
                validated.email.value = match[0];
            } else {
                validated.errors.push("Такой пользователь уже существует.");
            }
        } else {
            validated.errors.push("Неверный адрес электронной почты.");
        }

        return validated;
    }

    async check_password_auth(email, password) {
        const validated = {
            user: this.#user,
            password: {
                success: false,
                value: null,
            },
            errors: []
        };

        console.log('password, this.#user.password: ', password, this.#user?.password);
        
        const match = this.#user ? await bcrypt.compare(password, this.#user.password) : '';
        
        if (!match) {
            validated.errors.push("Неверный пароль.");
        } else {
            validated.password.success = true;
            validated.password.value = password;
        }
        
        return validated;
    }

    async check_password_reg(password) {
        const validated = {
            user: this.#user,
            password: {
                success: false,
                value: null,
            },
            errors: []
        };

        // console.log('password: ', password);

        if (!password || typeof password !== 'string') {
            validated.errors.push("Пароль не может быть пустым.");
        }

        if (password.length < 6) {
            validated.errors.push("Пароль должен быть не менее 6 символов.");
        }

        if (!password.match(/[a-z]/)) {
            validated.errors.push("Пароль должен содержать строчные буквы.");
        }

        if (!password.match(/[A-Z]/)) {
            validated.errors.push("Пароль должен содержать заглавные буквы.");
        }

        if (!password.match(/[0-9]/)) {
            validated.errors.push("Пароль должен содержать цифры.");
        }
        
        if (!validated.errors.length) {
            validated.password.success = true;
            validated.password.value = password;
        }

        return validated;
    }

    check_confirm(password, confirm) {
        const validated = {
            user: this.#user,
            confirmation: {
                success: false,
                value: null,
            },
            errors: []
        };

        if (password !== confirm) {
            validated.errors.confirmation.push("Пароль не подтвержден.");
        } else {
            validated.confirmation.success = true;
            validated.confirmation.value = confirm;
        }

        return validated;
    }
}