/**
 * @param db {import('mongodb').Db}
 * @param client {import('mongodb').MongoClient}
 * @returns {Promise<void>}
 */
export const up = async (db, client) => {
    await db.collection('conversations').updateMany(
        { lastMessageSender: { $exists: false } },
        { 
            $set: { 
                chatTitle: '',
                chatImg: '',
                chatUsers: {},
                lastMessageSender: null,
                lastMessageStatus: 'delivered',
                lastMessageCreatedAt: new Date()
            } 
        }
    );
};

/**
 * @param db {import('mongodb').Db}
 * @param client {import('mongodb').MongoClient}
 * @returns {Promise<void>}
 */
export const down = async (db, client) => {
    await db.collection('conversations').updateMany(
        { lastMessageSender: { $exists: true } },
        { 
            $unset: { 
                chatTitle: '',
                chatImg: '',
                chatUsers: {},
                lastMessageSender: '',
                lastMessageStatus: '',
                lastMessageCreatedAt: ''
            } 
        }
    );
};
