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

        socket.on('join_chat', (chatId) => {
            if (!chatId) return;

            socket.join(chatId.toString());
            console.log(`Пользователь ${socket.id} вошел в комнату ${chatId}`);
        });

        // socket.on('get_last_messages', (data) => {
        //     console.log('📥 get_last_messages на сервере:', data);
            
        //     const [userId, chatId] = data; 

        //     let messages = [
        //         { id: 1, text: 'Привет!', senderId: userId, chatId: chatId },
        //         { id: 2, text: 'Как дела?', senderId: 2, chatId: chatId }
        //     ];

        //     socket.emit('get_last_messages', { messages });
        // });

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

        socket.on('send_new_message', async (newMessage) => {
            console.log('📥 send_new_message на сервере:', newMessage);
            
            try {
                const { savedMessage, errors } = await (new ChatController).saveMessage(newMessage);

                console.log('savedMessage: ', savedMessage);
                console.log('newMessage: ', newMessage);
                console.log('savedMessage.conversationId.toString(): ', savedMessage.conversationId.toString());
                
                if (!newMessage.chatId) {
                    socket.join(savedMessage.conversationId.toString());
                }
                
                io.to(savedMessage.conversationId.toString()).emit('new_incoming_message', { message: savedMessage, errors });

                // ⚠️ ВАЖНО: Если ты уже отправил 'get_new_sent_message' отправителю,
                // то второе событие 'new_incoming_message' тоже придет отправителю (потому что он в комнате).
                // Чтобы избежать дубля на клиенте, отправитель должен игнорировать 'new_incoming_message',
                // если senderId совпадает с его собственным ID.

            } catch (error) {
                console.error('Ошибка при сохранении сообщения:', error);
                // socket.emit('send_message_error', { message: 'Не удалось отправить сообщение' });
            }
        });

        socket.on('disconnect', () => {
            console.log('🔴 Пользователь отключился:', socket.id);
        });
    });
};