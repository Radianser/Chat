import { db } from "#config/db_conn.js";

export default class User {
    // async getAllUsers() {
    //     try {
    //         // const [rows] = await mysqlDB.query("SELECT * FROM users ORDER BY name DESC");
    //         const [rows] = await db.mysql.query("SELECT * FROM users ORDER BY name DESC");
    //         return rows;
    //     } catch (error) {
    //         console.log(error);
    //         return [];
    //     }
    // }

    // async getUser(id) {
    //     try {
    //         let query = `SELECT * FROM users WHERE id=${id}`;
    //         // const [rows] = await mysqlDB.query(query);
    //         const [rows] = await db.mysql.query(query);
    //         return rows[0];
    //     } catch (error) {
    //         console.log(error);
    //         return [];
    //     }
    // }

    // async getUsers() {
    //     try {
    //         let arr = [1, 8];
    //         let query = `SELECT * FROM users WHERE id IN (${arr})`;
    //         // const [rows] = await mysqlDB.query(query);
    //         const [rows] = await db.mysql.query(query);
    //         return rows;
    //     } catch (error) {
    //         console.log(error);
    //         return [];
    //     }
    // }

    // async getUsersTest() {
    //     try {
    //         // let query = "SELECT MIN(id) as id FROM users";
    //         // let query = "SELECT * FROM users ORDER BY age LIMIT 3";
    //         // let query = "SELECT SUM(id) as id_sum FROM users";
    //         // let query = "SELECT COUNT(*) as user_count FROM users";
    //         // let query = "SELECT age, COUNT(*) as user_count FROM users GROUP BY age";
    //         // let query = `SELECT
    //         //                 users.name, cities.name as city_name
    //         //             FROM
    //         //                 users
    //         //             LEFT JOIN cities ON cities.id=users.city_id`;
    //         // const [rows] = await mysqlDB.query(query);

    //         // let query = { _id: '69b2b2ffb41ffb2dbe4daf8e' };
    //         // let rows = await db.mongo.collection('users').find({ age: 28, salary: 100 }).toArray();
    //         // let rows = await db.mongo.collection('users').findOne({ age: 28, salary: 100 });
    //         // let rows = await db.mongo.collection('users').count({age: 28});

    //         // let params = { name: 1, _id: 0 };
    //         // let rows  = await db.mongo.collection('users').find().project(params).toArray();

    //         let rows = await db.mongo.collection('users').distinct('age');

    //         // console.log('rows: ', rows);
    //         return rows;
    //     } catch (error) {
    //         console.log(error);
    //         return [];
    //     }
    // }

    async createUser(name, email, password) {
        try {
            let query = `INSERT INTO users SET name = ?, email = ?, password = ?`;
            const [rows] = await db.mysql.query(query, [name, email, password]);
            return rows['insertId'];
        } catch (error) {
            console.log(error);
            return [];
        }
    }

    async findById(id) {
        try {
            let query = `SELECT * FROM users WHERE id = ?`;
            const [rows] = await db.mysql.query(query, [id]);
            return rows[0];
        } catch (error) {
            console.log(error);
            return [];
        }
    }

    async findByEmail(email) {
        try {
            let query = `SELECT * FROM users WHERE email = ?`;
            const [rows] = await db.mysql.query(query, [email]);
            return rows[0];
        } catch (error) {
            console.log(error);
            return [];
        }
    }

    async verifyUser(id) {
        try {
            let query = `UPDATE users SET verified_at = NOW() WHERE id = ?`;
            const [rows] = await db.mysql.query(query, [id]);
            return rows[0];
        } catch (error) {
            console.log(error);
            return [];
        }
    }

    async setNewPassword(id, password) {
        try {
            let query = `UPDATE users SET password = ? WHERE id = ?`;
            await db.mysql.query(query, [password, id]);

            let selectQuery = `SELECT id, email, name, created_at, verified_at FROM users WHERE id = ?`;
            const [rows] = await db.mysql.query(selectQuery, [id]);
            
            return rows[0];
        } catch (error) {
            console.log(error);
            return [];
        }
    }
}