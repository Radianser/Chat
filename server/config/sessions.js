import { setCsrfToken } from '#middlewares/SetCsrfToken.js';
import MongoStore from 'connect-mongo';

const interval = 60 * 60 * 1000; // 1 час в миллисекундах
const delay = 60 * 60 * 1000;

export const sessionParams = {
    // Аналог session.use_strict_mode: сервер сам генерирует ID
    secret: process.env.secret,
    resave: false,
    saveUninitialized: false,
    name: 'sid', // Имя куки
    store: MongoStore.create({
        // Если используешь mongoose
        // client: db.connection.getClient(), // mongoose 6+
        // Или строка подключения напрямую:
        mongoUrl: process.env.MONGO_DB_HOST + process.env.MONGO_DB_NAME,
        
        collectionName: 'sessions', // Название коллекции для сессий
        ttl: interval / 1000, // TTL в секундах (автоудаление просроченных)
        autoRemove: 'native', // Использовать нативный TTL индекс MongoDB
        autoRemoveInterval: 10, // Интервал проверки в минутах (если native)
        touchAfter: 24 * 3600, // Обновлять сессию не чаще раза в сутки (опционально)
        crypto: {
            secret: process.env.secret // Шифрование данных сессии
        },
        // Для продакшена:
        // stringify: false // Не сериализовать каждое поле отдельно
    }),
    cookie: {
        maxAge: interval,
        domain: 'localhost',
        path: '/',
        secure: false,   // session_set_cookie_params -> secure: true
        httpOnly: true, // session_set_cookie_params -> httponly: true
        sameSite: 'lax' // 'lax' для кросс-портовых запросов
    }
}

export async function sessionDrop(request, response, next) {
    if(!request.session.created) {
        await regenerateSession(request);
    } else {
        if(request.session.user && request.session.user.last_seen_at) {
            const lastSeen = new Date(request.session.user.last_seen_at).getTime();
            if(Date.now() - lastSeen > delay) {
                await regenerateSession(request);
            }
        }
    }
    next();
}

export async function regenerateSession(request) {
    try {
        return await new Promise((resolve, reject) => {
            const oldCsrfToken = request.session.csrf_token;
            
            request.session.regenerate((error) => {
                if (error) return reject(error);
                
                request.session.created = Date.now();
                
                if (oldCsrfToken) {
                    request.session.csrf_token = oldCsrfToken;
                }
                resolve();
            });
        });
    } catch (error) {
        console.log('regenerateSession error: ', error);
    }
}