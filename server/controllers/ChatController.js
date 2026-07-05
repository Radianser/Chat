import path from 'path';
import fs from 'fs';
import User from '#models/User.js';
import FieldsValidation, { ValidationError } from '#validation/FieldsValidation.js'

export default class MainController {
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
}