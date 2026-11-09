import { db } from "#config/db_conn.js";
import { ObjectId } from "mongodb";

export default class Chat {
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
}