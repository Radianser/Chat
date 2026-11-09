/**
 * @param db {import('mongodb').Db}
 * @param client {import('mongodb').MongoClient}
 * @returns {Promise<void>}
 */
export const up = async (db, client) => {
    await db.collection('messages').updateMany(
        { status: { $exists: false } },
        { 
            $set: {
                status: 'delivered',
                updatedAt: new Date()
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
    await db.collection('messages').updateMany(
        { status: { $exists: true } },
        { 
            $unset: { 
                status: '',
                updatedAt: ''
            } 
        }
    );
};
