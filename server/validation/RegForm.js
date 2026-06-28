import bcrypt from 'bcrypt';
import User from '#models/User.js';
import FieldsValidation from '#validation/FieldsValidation.js'

export default class RegFormValidation {
    #validation = null;

    constructor() {
        this.#validation = new FieldsValidation();
    }

    async check({ email, password, confirm }) {
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
            confirm: {
                success: false,
                value: null,
            },
            errors: {
                email: [],
                password: [],
                confirm: []
            }
        };

        const validated_email = await this.#validation.check_email_reg(email);
        validated = {
            ...validated,
            ...validated_email,
            errors: {
                ...validated.errors,
                ...validated_email.errors
            }
        };

        const validated_password = await this.#validation.check_password_reg(password);
        validated = {
            ...validated,
            ...validated_password,
            errors: {
                ...validated.errors,
                ...validated_password.errors
            }
        };

        const validated_confirm = await this.#validation.check_confirm(password, confirm);
        validated = {
            ...validated,
            ...validated_confirm,
            errors: {
                ...validated.errors,
                ...validated_confirm.errors
            }
        };

        if (!validated.errors.email.length && !validated.errors.password.length && !validated.errors.confirm.length) {
            validated.success = true;
        }

        return validated;
    }
}