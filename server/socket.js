import { Server } from 'socket.io';

let io = null;

export const initSocket = async (server) => {
    io = new Server(server, {
        cors: {
            origin: [
                process.env.WEB_CLIENT_URL
            ],
            methods: ["GET", "POST"],
            credentials: true,
        }
    });

    // 1. Слушаем ПОДКЛЮЧЕНИЕ клиента
    io.on('connection', (socket) => {
        console.log('🟢 Пользователь подключился:', socket.id);

        // 2. Внутри подключения слушаем ЕГО события
        socket.on('get_last_messages', (data) => {
            console.log('📥 get_last_messages на сервере:', data);
            
            // data — это то, что ты передал с клиента: [user.id, chat.id]
            const [userId, chatId] = data; 

            // Тут будет логика поиска сообщений в Mongo
            let messages = [
                { id: 1, text: 'Привет!', senderId: userId, chatId: chatId },
                { id: 2, text: 'Как дела?', senderId: 2, chatId: chatId }
            ];

            // 3. Отправляем ответ ОБРАТНО этому же клиенту
            socket.emit('get_last_messages', { messages });
        });

        socket.on('disconnect', () => {
            console.log('🔴 Пользователь отключился:', socket.id);
        });
    });
};