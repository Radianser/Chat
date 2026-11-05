import { db } from "#config/db_conn.js";

export default class User {
    async createUser(name, email, password) {
        try {
            // let query = `INSERT INTO users SET name = ?, email = ?, password = ?`;
            // const [rows] = await db.mysql.query(query, [name, email, password]);
            // return rows['insertId'];

            const query = `
                INSERT INTO users (name, email, password)
                VALUES ($1, $2, $3)
                RETURNING id
            `;
            const result = await db.pg.query(query, [name, email, password]);
            return result.rows[0].id;
        } catch (error) {
            console.error('❌ Ошибка при создании пользователя:', error);
            // пробрасываем ошибку дальше, чтобы контроллер знал, что БД упала
            throw error;
        }
    }

    async findById(id) {
        try {
            // let query = `SELECT * FROM users WHERE id = ?`;
            // const [rows] = await db.mysql.query(query, [id]);
            // return rows[0];

            const query = `
                SELECT * FROM users
                WHERE id=$1
            `;
            const result = await db.pg.query(query, [id]);
            return result.rows[0] || null;
        } catch (error) {
            console.error('❌ Ошибка при поиске пользователя по id:', error);
            throw error; 
        }
    }

    async findByEmail(email) {
        try {
            // let query = `SELECT * FROM users WHERE email = ?`;
            // const [rows] = await db.mysql.query(query, [email]);
            // return rows[0];

            const query = `
                SELECT * FROM users
                WHERE email=$1
            `;
            const result = await db.pg.query(query, [email]);
            return result.rows[0] || null;
        } catch (error) {
            console.error('❌ Ошибка при поиске пользователя по email:', error);
            throw error; 
        }
    }

    async findByNameOrEmail(string) {
        try {
            // const pattern = `%${string}%`;
            // let query = `SELECT id, name, email, created_at, verified_at FROM users WHERE email LIKE ? OR name LIKE ?`;
            // const [rows] = await db.mysql.query(query, [pattern, pattern]);
            // return rows;

            const pattern = `%${string}%`;
            const query = `
                SELECT id, name, email, created_at, verified_at FROM users
                WHERE email LIKE $1 OR name LIKE $2
            `;
            const result = await db.pg.query(query, [pattern, pattern]);
            return result.rows || null;
        } catch (error) {
            console.error('❌ Ошибка при поиске пользователя по имени или почте:', error);
            throw error; 
        }
    }

    async verifyUser(id) {
        try {
            // let query = `UPDATE users SET verified_at = NOW() WHERE id = ?`;
            // const [rows] = await db.mysql.query(query, [id]);
            // return rows[0];

            const query = `
                UPDATE users
                SET verified_at=NOW()
                WHERE id=$1
            `;
            const result = await db.pg.query(query, [id]);
            return result.rows[0] || null;
        } catch (error) {
            console.error('❌ Ошибка при верификации пользователя:', error);
            throw error; 
        }
    }

    async setNewPassword(id, password) {
        try {
            // let query = `UPDATE users SET password = ? WHERE id = ?`;
            // await db.mysql.query(query, [password, id]);
            // let selectQuery = `SELECT id, email, name, created_at, verified_at FROM users WHERE id = ?`;
            // const [rows] = await db.mysql.query(selectQuery, [id]);
            // return rows[0];

            const query = `
                UPDATE users
                SET password=$1 WHERE id=$2
                RETURNING id, email, name, created_at, verified_at
            `;
            const result = await db.pg.query(query, [password, id]);
            return result.rows[0] || null;
        } catch (error) {
            console.error('❌ Ошибка при обновлении пароля:', error);
            throw error; 
        }
    }
}