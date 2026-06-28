import path from 'path';
import fs from 'fs';
import User from '#models/User.js';
import Token from '#models/Token.js';
import bcrypt from 'bcrypt';
import AuthFormValidation from '#validation/AuthForm.js'
import RegFormValidation from '#validation/RegForm.js'
import PassFormValidation from '#validation/PassForm.js'
import FieldsValidation from '#validation/FieldsValidation.js'
import MailController from '#controllers/MailController.js'
import dotenv from 'dotenv';
import { regenerateSession } from '#config/sessions.js';

dotenv.config();

export default class AuthController {
    constructor() {}

    get_auth_user(request, response) {
        let user = {};

        if (request.session.user) {
            user = { ...request.session.user };
        }

        return response.status(200).type('application/json').send(user);
    }

    async authorize_user(request, response, next) {
        let validated = await (new AuthFormValidation).check(request.body);

        if(validated.success) {
            await regenerateSession(request);
            request.session.user = validated.user;
        }

        return response.status(200).type('application/json').send({
            'validated': validated.success,
            'user': request.session.user || null,
            'errors': validated.errors
        });
    }

    async registrate_user(request, response, next) {
        let validated = await (new RegFormValidation).check(request.body);

        if(validated.success) {
            const password = await bcrypt.hash(validated.password.value, 10);
            const id = await (new User).createUser(request.body.name, validated.email.value, password);
            const url = this.create_url_link('verification', id);

            (new MailController).send('registration', validated.email.value, url);
            validated.message = "Мы отправили вам письмо на электронную почту для завершения регистрации.";
        }

        return response.status(200).type('application/json').send({
            'validated': validated.success,
            'message': validated.message || '',
            'errors': validated.errors
        });
    }

    async restore_password(request, response, next) {
        let validated = await (new FieldsValidation).check_email_auth(request.body.email);

        if(validated.email.success) {
            const user = await (new User).findByEmail(validated.email.value);
            const url = this.create_url_link('change-password', user.id);

            (new MailController).send('password_restore', user.email, url);
            validated.message = "Мы отправили вам письмо на электронную почту для сброса пароля.";
        }

        return response.status(200).type('application/json').send({
            'validated': validated.email.success,
            'message': validated.message || '',
            'errors': validated.errors
        });
    }

    async change_password(request, response, next) {
        let validated = await (new PassFormValidation).check(request.body.password, request.body.confirm);

        if(validated.success) {
            const password = await bcrypt.hash(validated.password.value, 10);
            const user = await (new User).setNewPassword(request.body.id, password);

            await regenerateSession(request);
            request.session.user = user;
        }

        return response.status(200).type('application/json').send({
            'validated': validated.success,
            'errors': validated.errors
        });
    }

    async verify_token(request, response, next) {
        const token = await (new Token).find(request.body.token, request.body.user_id);

        if(token && Date.now() - new Date(token.created_at).getTime() < 15 * 60 * 1000) {
            const userModel = new User();
            await userModel.verifyUser(request.body.user_id);
            const user = await userModel.findById(request.body.user_id);

            await regenerateSession(request, next);
            request.session.user = user;

            return response.status(200).type('application/json').send({ 'code': 'OK', 'result': process.env.APP_DOMAIN });
        } else {
            return response.status(200).type('application/json').send({ 'code': 'ERROR', 'result': 'Link has expired' });
        }
    }

    async logout_user(request, response, next) {
        await regenerateSession(request, next);
        return response.status(200).type('application/json').send({ 'code': 'OK', 'result': null });
    }

    create_url_link(action, user_id) {
        const token = this.get_random_string(40);
        (new Token).create(token, user_id);
        return process.env.APP_DOMAIN + `/${action}/${user_id}/${token}`;
    }

    get_random_string(length = 30) {
        const characters = '0123456789abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let string = '';

        for (let i = 0; i < length; i++) {
            let randomInt = Math.floor(Math.random() * characters.length);
            string += characters[randomInt];
        }

        return string;
    }
}