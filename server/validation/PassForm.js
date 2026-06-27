import bcrypt from 'bcrypt';
import User from '#models/User.js';
import FieldsValidation from '#validation/FieldsValidation.js'

export default class PassFormValidation {
    #validation = null;

    constructor() {
        this.#validation = new FieldsValidation();
    }

    async check(password, confirm) {
        let validated = {
            user: null,
            success: false,
            password: {
                success: false,
                value: null,
            },
            confirm: {
                success: false,
                value: null,
            },
            errors: {
                password: [],
                confirm: []
            }
        };

        console.log('password, confirm: ', password, confirm);

        const validated_password = await this.#validation.check_password_reg(password);
        validated = {
            ...validated,
            ...validated_password,
            errors: {
                ...validated.errors,
                password: validated_password.errors
            }
        };

        const validated_confirm = this.#validation.check_confirm(password, confirm);
        validated = {
            ...validated,
            ...validated_confirm,
            errors: {
                ...validated.errors,
                confirm: validated_confirm.errors
            }
        };

        if (!validated.errors.password.length && !validated.errors.confirm.length) {
            validated.success = true;
        }

        return validated;
    }
}