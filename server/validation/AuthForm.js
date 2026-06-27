import bcrypt from 'bcrypt';
import User from '#models/User.js';
import FieldsValidation from '#validation/FieldsValidation.js'

export default class AuthFormValidation {
    #user = null;

    constructor() {}

    async check({ email, password }) {
        const validation = new FieldsValidation();

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

        const validated_email = await validation.check_email_auth(email);
        validated = {
            ...validated,
            ...validated_email,
            errors: {
                ...validated.errors,
                email: validated_email.errors
            }
        };

        const validated_password = await validation.check_password_auth(email, password);
        validated = {
            ...validated,
            ...validated_password,
            errors: {
                ...validated.errors,
                password: validated_password.errors
            }
        };

        if (!validated.errors.email.length && !validated.errors.password.length) {
            validated.success = true;
        }

        delete validated.user?.password;

        return validated;
    }
}