import { Server } from 'socket.io';
import ChatController from '#controllers/ChatController.js';
import UserController from '#controllers/UserController.js';
import { db } from "#config/db_conn.js";

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

    const onlineUsers = new Map();

    io.on('connection', async (socket) => {
        console.log('🟢 Пользователь подключился:', socket.id);
        const userId = socket.handshake.auth.userId;
        console.log('🟢 handshake:', userId);

        if (userId) {
            socket.userId = String(userId);
            onlineUsers.set(socket.userId, socket.id);
            socket.join(`user_${socket.userId}`);

            await changeUserStatus(socket, {
                userId: socket.userId,
                isOnline: true
            });

            console.log('✅ onlineUsers обновлен:', Array.from(onlineUsers.keys()));
        }

        socket.on('join_chat', (chatId) => {
            if (!chatId) return;

            socket.join(chatId.toString());
            console.log(`Пользователь ${socket.id} вошел в комнату ${chatId}`);
        });

        socket.on('get_chat_list', async (data) => {
            console.log('📥 get_chat_list на сервере:', data);
            
            const [userId] = data;
            let conversations = await (new ChatController).getChatList(userId);

            socket.emit('get_chat_list', conversations);
        });

        socket.on('get_messages', async (data) => {
            // console.log('📥 get_messages на сервере:', data);
            
            const [chatId] = data;
            let messages = await (new ChatController).getChatMessages(chatId);

            socket.emit('get_messages', messages);
        });

        socket.on('send_new_message', async (newMessage) => {
            // console.log('📥 send_new_message на сервере:', newMessage);
            
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

        socket.on('get_user_status', async (userIds) => {
            console.log('onlineUsers: ', onlineUsers);

            for (const userId of userIds) {
                const onlineUser = onlineUsers.get(String(userId));

                if (onlineUser) {
                    socket.emit('user_status_received', {
                        userId: userId,
                        isOnline: true
                    });
                } else {
                    try {
                        const result = await db.pg.query(
                            'SELECT last_seen_at FROM users WHERE id = $1',
                            [userId]
                        );
                        
                        const lastSeen = result.rows[0]?.last_seen_at || null;

                        socket.emit('user_status_received', {
                            userId: userId,
                            isOnline: false,
                            lastSeen: lastSeen
                        });
                    } catch (error) {
                        console.error('Ошибка при получении статуса из БД:', error);
                        socket.emit('user_status_received', {
                            userId: userId,
                            isOnline: false,
                            lastSeen: null
                        });
                    }
                }
            }
        });

        socket.on('disconnect', async () => {
            if (!socket.userId) return;

            onlineUsers.delete(socket.userId);
            const lastSeen = await (new UserController).updateUserLastSeenTime(socket.userId);
            
            await changeUserStatus(socket, {
                userId: socket.userId,
                isOnline: false,
                lastSeen: lastSeen
            });

            console.log('🔴 Пользователь отключился:', socket.id);
            console.log('🔴 onlineUsers обновлен:', Array.from(onlineUsers.keys()));
        });
    });

    async function changeUserStatus(socket, user) {
        const userChats = await db.mongo.collection('conversations').find({
            participants: Number(user.userId)
        }).toArray();
        const companionIds = new Set();

        userChats.forEach(chat => {
            chat.participants.forEach(id => { 
                if (String(id) !== String(user.userId)) {
                    companionIds.add(String(id))
                }; 
            })
        });

        companionIds.forEach(id => {
            io.to(`user_${id}`).emit('user_status_received', user);
        });
    }
};