import { db } from "#config/db_conn.js";

export default class Chat {
    async getUserChats(user_id) {
        try {
            return await db.mongo.collection('conversations')
                .find({ participants: user_id })
                .sort({ updatedAt: -1 })
                .toArray();
        } catch (error) {
            console.error('❌ Ошибка при поиске чатов пользователя:', error);
            throw error;
        }
    }
}