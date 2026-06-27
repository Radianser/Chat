import { db } from "#config/db_conn.js";

export default class Token {
    async create(token, user_id) {
        try {
            let query = `INSERT INTO tokens SET value='${token}', user_id=${Number(user_id)}`;
            const [rows] = await db.mysql.query(query);
            return rows[0];
        } catch (error) {
            console.log(error);
            return [];
        }
    }

    async find(token, user_id) {
        try {
            // let query = `SELECT * FROM tokens WHERE value='${token}', user_id=${Number(user_id)}`;
            // const [rows] = await db.mysql.query(query);

            let query = 'SELECT * FROM tokens WHERE value = ? AND user_id = ?';
            const [rows] = await db.mysql.query(query, [token, user_id]);

            // console.log('!!!findToken: ', rows[0]);

            return rows[0];
        } catch (error) {
            console.log(error);
            return [];
        }
    }
}