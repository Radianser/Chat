import './env.js';
import path from 'path';

import express from 'express';
import expressSession from 'express-session';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import { createServer } from 'node:http';
import { initRoutes } from '#config/routes.js';
import { sessionParams, sessionDrop } from '#config/sessions.js';
import { initDatabases } from "#config/db_conn.js";
import { setCsrfToken } from '#middlewares/CsrfMiddleware.js';
import { initSocket } from "./socket.js";

const app = express();
const server = createServer(app);

// 1. Логирование запросов
app.use((req, res, next) => {
    console.log(`📥 [${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// 2. CORS (обязательно до сессий и роутов)
app.use(cors({
    origin: [process.env.WEB_CLIENT_URL],
    credentials: true
}));

// 3. Статика и парсеры
app.use('/resources', express.static(path.join(process.cwd(), 'resources')));
app.use(express.json()); // для JSON-данных (application/json)
app.use(express.urlencoded({ extended: true })); // для обычных форм (application/x-www-form-urlencoded)

// 4. Сессии и CSRF
app.use(cookieParser(process.env.secret));
app.use(expressSession(sessionParams));
app.use(sessionDrop);
app.use(setCsrfToken); // устанавливаем CSRF токен

// 5. Эндпоинт для получения CSRF токена
app.get('/csrf-token', (req, res) => res.json({
    csrfToken: req.session.csrf_token
}));

// 6. Запуск сервера
const startServer = async () => {
    await initDatabases();
    await initRoutes(app);
    await initSocket(server);

    // 7. Обработчик 404
    app.use((req, res) => {
        if (!res.headersSent) {
            return res.status(404).json({ 
                error: 'API endpoint not found',
                method: req.method,
                path: req.path
            });
        }
    });

    server.listen(3000, () => {
        console.log(`Server is running on port ${3000}`);
    });
};

startServer();