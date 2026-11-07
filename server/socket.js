import { Server } from 'socket.io';
import ChatController from '#controllers/ChatController.js';

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

    // слушаем подключение клиента
    io.on('connection', (socket) => {
        console.log('🟢 Пользователь подключился:', socket.id);

        // слушаем события клиента
        socket.on('get_last_messages', (data) => {
            console.log('📥 get_last_messages на сервере:', data);
            
            const [userId, chatId] = data; 

            let messages = [
                { id: 1, text: 'Привет!', senderId: userId, chatId: chatId },
                { id: 2, text: 'Как дела?', senderId: 2, chatId: chatId }
            ];

            socket.emit('get_last_messages', { messages });
        });

        socket.on('get_user_chats', async (data) => {
            console.log('📥 get_user_chats на сервере:', data);
            
            const [userId] = data;
            let conversations = await (new ChatController).getUserChats(userId);

            socket.emit('get_user_chats', conversations);
        });

        socket.on('disconnect', () => {
            console.log('🔴 Пользователь отключился:', socket.id);
        });
    });
};