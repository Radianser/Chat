import path from 'path';
import fs from 'fs';
import User from '#models/User.js';
import Chat from '#models/Chat.js';
import FieldsValidation, { ValidationError } from '#validation/FieldsValidation.js'

export default class ChatController {
    constructor() {}

    async find_chats(request, response) {
        let chats = [];
        let errors = [];

        try {
            let validated = (new FieldsValidation).check_string(request.body.string);
            chats = await (new User).findByNameOrEmail(validated);
        } catch (error) {
            if (error instanceof ValidationError) {
                errors = error.errors;
            } else {
                errors = [error.message];
            }
        }

        if (!errors.length && !chats.length) {
            errors.push('No chats found');
        }

        return response.status(200).type('application/json').send({
            'chats': chats,
            'errors': errors
        });
    }

    async getUserChats(userId) {
        let chats = [];
        let errors = [];

        try {
            chats = await (new Chat).getUserChats(userId);
        } catch (error) {
            errors = [error.message];
        }

        console.log('RESULT: ', {
            'chats': chats,
            'errors': errors
        });

        return {
            chats,
            errors
        }
    }
}