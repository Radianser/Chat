import { db } from "#config/db_conn.js";

export default class Token {
    async create(token, user_id) {
        try {
            // let query = `INSERT INTO tokens SET value='${token}', user_id=${Number(user_id)}`;
            // const [rows] = await db.mysql.query(query);
            // return rows[0];

            const query = `
                INSERT INTO tokens (value, user_id) 
                VALUES ($1, $2) 
                RETURNING id
            `;
            const result = await db.pg.query(query, [token, user_id]);
            return result.rows[0] || null;
        } catch (error) {
            console.error('❌ Ошибка при создании токена:', error);
            throw error;
        }
    }

    async find(token, user_id) {
        try {
            // let query = 'SELECT * FROM tokens WHERE value = ? AND user_id = ?';
            // const [rows] = await db.mysql.query(query, [token, user_id]);
            // return rows[0];

            const query = `
                SELECT * FROM tokens
                WHERE value=$1 AND user_id=$2
            `;
            const result = await db.pg.query(query, [token, user_id]);
            return result.rows[0] || null;
        } catch (error) {
            console.error('❌ Ошибка при поиске токена:', error);
            throw error;
        }
    }
}