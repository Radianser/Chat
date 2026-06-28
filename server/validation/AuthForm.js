import bcrypt from 'bcrypt';
import User from '#models/User.js';
import FieldsValidation from '#validation/FieldsValidation.js'

export default class AuthFormValidation {
    #validation = null;

    constructor() {
        this.#validation = new FieldsValidation();
    }

    async check({ email, password }) {
        let validated = {
            user: null,
            success: false,
            email: {
                success: false,
                value: null,
            },
            password: {
                success: false,
                value: null,
            },
            errors: {
                email: [],
                password: []
            }
        };

        const validated_email = await this.#validation.check_email_auth(email);
        validated = {
            ...validated,
            ...validated_email,
            errors: {
                ...validated.errors,
                ...validated_email.errors
            }
        };

        const validated_password = await this.#validation.check_password_auth(email, password);
        validated = {
            ...validated,
            ...validated_password,
            errors: {
                ...validated.errors,
                ...validated_password.errors
            }
        };

        if (!validated.errors.email.length && !validated.errors.password.length) {
            validated.success = true;
        }

        delete validated.user?.password;

        return validated;
    }
}