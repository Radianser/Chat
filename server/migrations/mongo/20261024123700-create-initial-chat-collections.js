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
                required: ['type', 'participants', 'createdAt', 'updatedAt'],
                properties: {
                type: {
                    enum: ['direct', 'group'],
                    description: 'Тип чата: личный или групповой',
                },
                participants: {
                    bsonType: 'array',
                    description: 'Массив ID пользователей из MySQL',
                    items: { bsonType: 'int' }, // Предполагаем, что ID в MySQL числовые
                },
                lastMessage: {
                    bsonType: 'object',
                    description: 'Денормализация для быстрого отображения списка чатов',
                },
                createdAt: { bsonType: 'date' },
                updatedAt: { bsonType: 'date' },
                },
            },
        },
    });

    // Индекс для быстрого получения списка чатов пользователя (отсортированных по времени)
    await db.collection('conversations').createIndex(
        { participants: 1, updatedAt: -1 }
    );

    // 2. Создаем коллекцию для сообщений (messages)
    await db.createCollection('messages', {
        validator: {
            $jsonSchema: {
                bsonType: 'object',
                required: ['conversationId', 'senderId', 'type', 'createdAt'],
                properties: {
                conversationId: { bsonType: 'objectId' },
                senderId: { bsonType: 'int' },
                type: { enum: ['text', 'image', 'file'] },
                text: { bsonType: 'string' },
                createdAt: { bsonType: 'date' },
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
