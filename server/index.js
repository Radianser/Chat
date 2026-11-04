import './env.js';
import path from 'path';

import express from 'express';
import expressSession from 'express-session';
import cookieParser from 'cookie-parser';
import { initRoutes } from '#config/routes.js';
import { sessionParams, sessionDrop } from '#config/sessions.js';
import { initDatabases, db } from "#config/db_conn.js";
import cors from 'cors';
import { setCsrfToken, generateCsrfToken } from '#middlewares/SetCsrfToken.js';
import { createServer } from 'node:http';
import { initSocket } from "./socket.js";

const app = express();
const server = createServer(app);

// Логирование ВСЕХ запросов (для отладки)
app.use((req, res, next) => {
    console.log(`📥 [${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

app.use(cors({
    origin: [
        process.env.WEB_CLIENT_URL
    ],
    credentials: true
})); // Чтобы фронтенд мог делать запросы к бэку

app.use('/resources', express.static(path.join(process.cwd(), 'resources')));
app.use(express.json()); // Для JSON-данных (application/json)
app.use(express.urlencoded({ extended: true })); // Для обычных форм (application/x-www-form-urlencoded)
app.use(cookieParser(process.env.secret));
app.use(expressSession(sessionParams));
app.use(sessionDrop);

// зачем? вроде потом и так создаем
app.use(setCsrfToken); // Устанавливаем CSRF токен

// Эндпоинт для получения CSRF токена
app.get('/csrf-token', (req, res) => {
    // Если токен пустой, генерируем его принудительно
    if (!req.session.csrf_token) {
        req.session.csrf_token = generateCsrfToken();
        console.log('Generated new token:', req.session.csrf_token);
    }
    
    return res.json({ 
        csrfToken: req.session.csrf_token 
    });
});

const gracefulShutdown = async (signal) => {
    console.log(`\nПолучен сигнал ${signal}. Закрываю соединения с БД...`);
    try {
        await db.closeAll();
        console.log('Все соединения успешно закрыты. Выход.');
        process.exit(0);
    } catch (err) {
        console.error('Ошибка при закрытии соединений:', err);
        process.exit(1);
    }
};

// Перехватываем Ctrl+C (в терминале)
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Перехватываем завершение процесса (например, при перезагрузке nodemon)
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

const startServer = async () => {
    await initDatabases();
    await initRoutes(app);
    await initSocket(server);

    // Обработчик 404 для API запросов
    app.use((req, res) => {
        if (!res.headersSent) {
            return res.status(404).json({ 
                error: 'API endpoint not found',
                method: req.method,
                path: req.path
            });
        }
    });

    // Запускаем сервер
    server.listen(3000, () => {
        console.log(`Server is running on port ${3000}`);
    });
};

startServer();