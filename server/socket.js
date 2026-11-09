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

        socket.on('get_chat_list', async (data) => {
            console.log('📥 get_chat_list на сервере:', data);
            
            const [userId] = data;
            let conversations = await (new ChatController).getChatList(userId);

            socket.emit('get_chat_list', conversations);
        });

        socket.on('get_messages', async (data) => {
            console.log('📥 get_messages на сервере:', data);
            
            const [chatId] = data;
            let messages = await (new ChatController).getChatMessages(chatId);

            socket.emit('get_messages', messages);
        });

        socket.on('disconnect', () => {
            console.log('🔴 Пользователь отключился:', socket.id);
        });
    });
};