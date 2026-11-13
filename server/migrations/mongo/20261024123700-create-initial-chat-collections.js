/**
 * @param db {import('mongodb').Db}
 * @param client {import('mongodb').MongoClient}
 * @returns {Promise<void>}
 */
export const up = async (db, client) => {
    // 1. Создаем коллекцию для чатов (conversations)
    // Валидация гарантирует, что без обязательных полей чат не создастся
    await db.createCollection('conversations', {
        validator: {
            $jsonSchema: {
                bsonType: 'object',
                required: [
                    'type',
                    'participants',
                    'chatUsers',
                    'lastMessage',
                    'lastMessageSender',
                    'lastMessageStatus',
                    'lastMessageCreatedAt',
                    'createdAt',
                    'isPrivate',
                ],
                properties: {
                    type: { enum: ['direct', 'group'] },
                    participants: {
                        bsonType: 'array',
                        items: { bsonType: 'int' },
                    },
                    chatTitle: { bsonType: 'string' },
                    chatImg: { bsonType: 'string' },
                    chatUsers: { bsonType: 'object' },
                    lastMessage: { bsonType: 'string' },
                    lastMessageSender: { bsonType: 'int' },
                    lastMessageStatus: { bsonType: 'string' },
                    lastMessageCreatedAt: { bsonType: 'date' },
                    createdAt: { bsonType: 'date' },
                    isPrivate: { bsonType: 'bool' },
                },
            },
        },
    });

    // Индекс для быстрого получения списка чатов пользователя (отсортированных по времени)
    await db.collection('conversations').createIndex(
        { participants: 1, lastMessageCreatedAt: -1 }
    );

    // 2. Создаем коллекцию для сообщений (messages)
    await db.createCollection('messages', {
        validator: {
            $jsonSchema: {
                bsonType: 'object',
                required: ['conversationId', 'senderId', 'type', 'status', 'createdAt', 'updatedAt'],
                properties: {
                    conversationId: { bsonType: 'objectId' },
                    senderId: { bsonType: 'int' },
                    type: { enum: ['text', 'image', 'file'] },
                    text: { bsonType: 'string' },
                    status: { enum: ['sent', 'read'] },
                    createdAt: { bsonType: 'date' },
                    updatedAt: { bsonType: 'date' },
                },
            },
        },
    });

    // Самый важный индекс для чата: быстро достать историю конкретного диалога
    await db.collection('messages').createIndex(
        { conversationId: 1, createdAt: -1 }
    );
};

/**
 * @param db {import('mongodb').Db}
 * @param client {import('mongodb').MongoClient}
 * @returns {Promise<void>}
 */
export const down = async (db, client) => {
    await db.collection('messages').drop();
    await db.collection('conversations').drop();
};
