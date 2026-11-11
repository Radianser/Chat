import path from 'path';
import fs from 'fs';
import User from '#models/User.js';
import Chat from '#models/Chat.js';
import FieldsValidation, { ValidationError } from '#validation/FieldsValidation.js'
import { db } from "#config/db_conn.js";

export default class ChatController {
    constructor() {}

    async find_chats(request, response) {
        let errors = [];
        let resultChats = [];
        const searchString = request.body.string;

        try {
            // let validated = (new FieldsValidation).check_string(searchString);

            // 1. Ищем пользователей в PostgreSQL
            const postgreUsers = await (new User).findByNameOrEmail(searchString);

            // 2. Обрабатываем пользователей (как делали раньше)
            for (const user of postgreUsers) {
                if (user.id === request.session.user.id) continue;
                
                const existingChat = await db.mongo.collection('conversations').findOne({
                    type: 'direct',
                    participants: { $all: [request.session.user.id, user.id] }
                });

                if (existingChat) {
                    resultChats.push({
                        ...existingChat,
                        chatUsers: {
                            [request.session.user.id]: { name: request.session.user.name, img: request.session.user.img },
                            [user.id]: { name: user.name, img: user.img }
                        }
                    });
                } else {
                    // "Фейковый" чат для пользователя
                    resultChats.push({
                        _id: null,
                        type: 'direct',
                        chatTitle: user.name,
                        chatImg: user.img,
                        chatUsers: {
                            [request.session.user.id]: { name: request.session.user.name, img: request.session.user.img },
                            [user.id]: { name: user.name, img: user.img }
                        }
                    });
                }
            }

            // 3. Ищем публичные группы в MongoDB
            // (предполагаем, что у групп есть поля chatTitle и isPrivate)
            const mongoGroups = await db.mongo.collection('conversations').find({
                type: 'group',
                isPrivate: false, 
                chatTitle: { $regex: searchString, $options: 'i' } // Регистронезависимый поиск по названию
            }).toArray();

            // 4. Обрабатываем группы
            for (const group of mongoGroups) {
                // Проверяем, состоит ли текущий пользователь в этой группе
                const isMember = group.participants.includes(request.session.user.id);
                
                resultChats.push({
                    ...group,
                    isMember, // Полезно знать клиенту, можно ли сразу писать в группу
                });
            }

            if (!resultChats.length) {
                errors.push('No chats found');
            }

            return response.json({ chats: resultChats, errors });
        } catch (error) {
            // if (error instanceof ValidationError) {
            //     errors = error.errors;
            // } else {
            //     errors = [error.message];
            // }

            console.error(error);
            return response.status(500).json({ chats: [], errors: [error.message] });
        }
    }

    async getChatList(userId) {
        let chats = [];
        let errors = [];

        try {
            chats = await (new Chat).getChatList(userId);
        } catch (error) {
            errors = [error.message];
        }

        return {
            chats,
            errors
        }
    }

    async getChatMessages(chatId) {
        let messages = [];
        let errors = [];

        try {
            messages = await (new Chat).getChatMessages(chatId);
        } catch (error) {
            errors = [error.message];
        }

        return {
            messages,
            errors
        }
    }

    async saveMessage(message) {
        let chatId = message.chatId;
        let savedMessage = null;
        let errors = [];

        try {
            if (!chatId) {
                chatId = await (new Chat).createChat(message);
            } else {
                await (new Chat).updateChat(message);
            }

            savedMessage = await (new Chat).saveMessage({ ...message, chatId });
        } catch (error) {
            errors = [error.message];
        }

        return {
            savedMessage,
            errors
        }
    }
}