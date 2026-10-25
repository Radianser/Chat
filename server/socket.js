// import { createServer } from 'node:http';
import { Server } from 'socket.io';

let io = null;

export const initSocket = async (server) => {
    // Создаём экземпляр Socket.IO, привязывая его к HTTP-серверу
    io = new Server(server, {
        cors: {
            origin: [
                process.env.WEB_CLIENT_URL
            ],
            methods: ["GET", "POST"],
            credentials: true,
        }
    });

    io.on("connection_error", (err) => {
        console.log('🔴 Socket.IO connection error: ', err);
    });

    // Слушаем событие 'connection' — оно срабатывает при подключении нового клиента
    io.on('connection', (socket) => {
        console.log('Пользователь подключился:', socket.id);

        // socket.on(`new_msg_${socket.id}`, (msg) => {
        //     // отправляет событие всем, кроме отправителя
        //     socket.broadcast.emit(`new_msg_${socket.id}`);
        // });

        // socket.on(`user_connected`, (msg) => {
        //     // Отправляет событие только одному конкретному клиенту
        //     socket.emit(`user_connected`, msg)
        // });

        // socket.on(`user_disconnected`, (msg) => {
        //     // отправляет событие всем, кроме отправителя
        //     socket.broadcast.emit(`user_disconnected`);
        // });

        // 👇 рассылаем ВСЕМ, КРОМЕ этого сокета
        socket.broadcast.emit('user_connect', { id: socket.id });

        socket.on('disconnect', () => {
            socket.broadcast.emit('user_disconnect', { id: socket.id });
        });
    });
};