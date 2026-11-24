import { db } from "#config/db_conn.js";
import { ObjectId } from "mongodb";

export default class Chat {
    async createChat(message) {
        try {
            const newChat = {
                type: 'direct',
                participants: message.participants,
                chatTitle: '',
                chatImg: '',
                chatUsers: message.chatUsers,
                lastMessage: message.text,
                lastMessageId: message._id,
                lastMessageSender: message.senderId,
                lastMessageStatus: 'sent',
                lastMessageCreatedAt: new Date(),
                isPrivate: true,
                createdAt: new Date()
            };

            const result = await db.mongo.collection('conversations').insertOne(newChat);
            newChat._id = result.insertedId;

            return {
                conversation: newChat,
                conversationId: result.insertedId
            };
        } catch (error) {
            console.error('❌ Ошибка при создании чата:', error);
            throw error;
        }
    }

    async updateChat(message) {
        try {
            await db.mongo.collection('conversations').updateOne(
                { _id: new ObjectId(message.conversationId) },
                {
                    $set: {
                        lastMessage: message.text,
                        lastMessageId: message._id,
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

    async getChatById(id) {
        try {
            return await db.mongo.collection('conversations').findOne({ _id: new ObjectId(id) });
        } catch (error) {
            console.error('❌ Ошибка при поиске чатов пользователя:', error);
            throw error;
        }
    }

    async getChatList(userId) {
        try {
            return await db.mongo.collection('conversations').aggregate([
                // 1. Находим все чаты пользователя
                {
                    $match: {
                        participants: Number(userId)
                    }
                },
                // 2. Присоединяем сообщения, которые не прочитаны и отправлены не мной
                {
                    $lookup: {
                        from: 'messages',
                        let: { chatId: '$_id' }, // Берем _id текущего чата
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ['$conversationId', '$$chatId'] }, // Сообщение из этого чата
                                            { $ne: ['$senderId', Number(userId)] },   // Отправлено НЕ мной
                                            { $eq: ['$status', 'sent'] }              // Еще не прочитано
                                        ]
                                    }
                                }
                            }
                        ],
                        as: 'unreadMessages'
                    }
                },
                // 3. Добавляем поле unreadCount (длина массива unreadMessages)
                {
                    $addFields: {
                        unreadCount: { $size: '$unreadMessages' }
                    }
                },
                // 4. Убираем сам массив unreadMessages (он нам больше не нужен, только счетчик)
                {
                    $project: {
                        unreadMessages: 0
                    }
                },
                // 5. Сортируем по последнему сообщению
                {
                    $sort: { updatedAt: -1 }
                }
            ]).toArray();
        } catch (error) {
            console.error('❌ Ошибка при получении чатов пользователя:', error);
            throw error;
        }
    }

    async getChatMessages(chatId) {
        console.log('chatId: ', chatId);
        try {
            return await db.mongo.collection('messages')
                .find({ conversationId: new ObjectId(chatId) })
                .sort({ createdAt: 1 })
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
                conversationId: new ObjectId(message.conversationId),
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

    async updateMessage(message) {
        try {
            const updatedMessage = {
                _id: new ObjectId(message._id),
                conversationId: new ObjectId(message.conversationId),
                senderId: message.senderId,
                type: message.type,
                text: message.text,
                status: message.status,
                createdAt: message.createdAt,
                updatedAt: new Date()
            };

            await db.mongo.collection('messages').updateOne(
                { _id: new ObjectId(message._id) },
                {
                    $set: {
                        type: message.type,
                        text: message.text,
                        status: message.status,
                        updatedAt: new Date()
                    }
                }
            );

            return updatedMessage;
        } catch (error) {
            console.error('❌ Ошибка при обновлении сообщения:', error);
            throw error;
        }
    }

    async updateMessageStatuses(chatId, userId, lastReadMessageCreatedAt, isMessageLast) {
        try {
            await db.mongo.collection('messages').updateMany(
                { 
                    conversationId: new ObjectId(chatId),
                    senderId: { $ne: Number(userId) }, // Not Equal, $eq Equal
                    status: { $ne: 'read' }, // Not Equal
                    createdAt: { $lte: new Date(lastReadMessageCreatedAt) } // Less Than or Equal
                },
                { $set: { status: 'read' } }
            );

            if (!isMessageLast) return;

            await db.mongo.collection('conversations').updateOne(
                {  _id: new ObjectId(chatId) },
                { $set: { lastMessageStatus: 'read' } }
            );
        } catch (error) {
            console.error('❌ Ошибка при смене статусов сообщений:', error);
            throw error;
        }
    }
}