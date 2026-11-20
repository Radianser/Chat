/**
 * @param db {import('mongodb').Db}
 * @param client {import('mongodb').MongoClient}
 * @returns {Promise<void>}
 */
export const up = async (db, client) => {
    await db.collection('conversations').updateMany(
        { lastMessageId: { $exists: false } }, 
        {
            $set: {
                lastMessageId: null
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
        { lastMessageId: { $exists: true } }, 
        {
            $unset: {
                lastMessageId: ''
            }
        }
    );
};
