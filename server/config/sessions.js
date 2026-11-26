import '../env.js';
import MongoStore from 'connect-mongo';

const interval = 60 * 60 * 1000;

export const sessionParams = {
    // Аналог session.use_strict_mode: сервер сам генерирует ID
    secret: process.env.secret,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    name: 'sid', // Имя куки
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_DB_HOST,
        collectionName: 'sessions', // Название коллекции для сессий
        ttl: interval / 1000, // TTL в секундах (автоудаление просроченных)
        // autoRemove: 'native', // Использовать нативный TTL индекс MongoDB
        // autoRemoveInterval: 10, // Интервал проверки в минутах (если native)
        // touchAfter: 24 * 3600, // Обновлять сессию не чаще раза в сутки (опционально)
        crypto: {
            secret: process.env.secret // Шифрование данных сессии
        },
        // Для продакшена:
        // stringify: false // Не сериализовать каждое поле отдельно
    }),
    cookie: {
        maxAge: interval, // тут нужны миллисекунды
        // domain: 'localhost',
        path: '/',
        secure: false,   // session_set_cookie_params -> secure: true
        httpOnly: true,  // session_set_cookie_params -> httponly: true
        sameSite: 'lax'  // 'lax' для кросс-портовых запросов
    }
}