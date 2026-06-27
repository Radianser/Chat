// generate_hash.js
import bcrypt from 'bcrypt';

const password = '111111aA';

async function generateHash() {
    try {
        const hash = await bcrypt.hash(password, 10);
        console.log('Пароль:', password);
        console.log('Хеш:', hash);
    } catch (error) {
        console.error('Ошибка:', error);
    }
}

generateHash();