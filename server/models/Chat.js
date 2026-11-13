import { db } from "#config/db_conn.js";
import { ObjectId } from "mongodb";

export default class Chat {
    async createChat(message) {
        try {
            const result = await db.mongo.collection('conversations')
                .insertOne({
                    type: 'direct',
                    participants: message.participants,
                    chatTitle: '',
                    chatImg: '',
                    chatUsers: message.chatUsers,
                    lastMessage: message.text,
                    lastMessageSender: message.senderId,
                    lastMessageStatus: 'sent',
                    lastMessageCreatedAt: new Date(),
                    isPrivate: true,
                    createdAt: new Date()
                });
            return result.insertedId;
        } catch (error) {
            console.error('❌ Ошибка при создании чата:', error);
            throw error;
        }
    }

    async updateChat(message) {
        try {
            await db.mongo.collection('conversations').updateOne(
                { _id: new ObjectId(message.chatId) },
                {
                    $set: {
                        lastMessage: message.text,
                        lastMessageSender: message.senderId,
                        lastMessageStatus: 'sent',
                        lastMessageCreatedAt: new Date(),
                        updatedAt: new Date()
                    }
                }
            );
        } catch (error) {
            console.error('❌ Ошибка при обновлении чата:', error);
            throw error;
        }
    }

    async getChatList(userId) {
        try {
            return await db.mongo.collection('conversations')
                .find({ participants: userId })
                .sort({ updatedAt: -1 })
                .toArray();
        } catch (error) {
            console.error('❌ Ошибка при поиске чатов пользователя:', error);
            throw error;
        }
    }

    async getChatMessages(chatId) {
        console.log('chatId: ', chatId);
        try {
            return await db.mongo.collection('messages')
                .find({ conversationId: new ObjectId(chatId) })
                .sort({ updatedAt: 1 })
                .toArray();
        } catch (error) {
            console.error('❌ Ошибка при поиске сообщений чата:', error);
            throw error;
        }
    }

    async getChatListBySearch(string) {
        try {
            return await db.mongo.collection('conversations')
                .find({ chatTitle: string, chatUsers: string })
                .sort({ updatedAt: 1 })
                .toArray();
        } catch (error) {
            console.error('❌ Ошибка при поиске сообщений чата:', error);
            throw error;
        }
    }

    async saveMessage(message) {
        try {
            const newMessage = {
                _id: new ObjectId(),
                conversationId: new ObjectId(message.chatId),
                senderId: message.senderId,
                type: message.type,
                text: message.text,
                status: 'sent',
                createdAt: new Date(),
                updatedAt: new Date()
            };
            await db.mongo.collection('messages').insertOne(newMessage);

            return newMessage;
        } catch (error) {
            console.error('❌ Ошибка при сохранинии сообщения:', error);
            throw error;
        }
    }
}