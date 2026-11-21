import { Server } from 'socket.io';
import ChatController from '#controllers/ChatController.js';
import User from '#models/User.js';
import Chat from '#models/Chat.js';
import { db } from "#config/db_conn.js";
import { ObjectId } from "mongodb";

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

            try {
                const { chats, errors } = await (new ChatController).getChatList(userId);

                chats.forEach(chat => {
                    socket.join(chat._id.toString());
                    console.log(`Сокет ${socket.id} подписан на комнату чата ${chat._id}`);
                });
            } catch (error) {
                console.error('Ошибка при подписке на чаты:', error);
            }

            await emitUserNewStatus(socket, {
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

        socket.on('user_typing', async (data) => {
            io.to(data.chatId).emit('user_typing', { id: data.userId, name: data.userName });
        });

        socket.on('send_new_message', async (newMessage) => {
            // console.log('📥 send_new_message на сервере:', newMessage);
            
            try {
                const { savedMessage, errors } = await (new ChatController).saveMessage(newMessage);

                if (!newMessage.conversationId) {
                    socket.join(savedMessage.conversationId.toString());
                }
                
                io.to(savedMessage.conversationId.toString()).emit('new_incoming_message', { message: savedMessage, errors });
            } catch (error) {
                console.error('Ошибка при сохранении сообщения:', error);
            }
        });

        socket.on('update_message', async (message) => {
            console.log('📥 update_message на сервере:', message);
            
            try {
                const { updatedMessage, errors } = await (new ChatController).updateMessage(message);

                io.to(message.conversationId).emit('message_updated', { updatedMessage, errors });
            } catch (error) {
                console.error('Ошибка при редактировании сообщения:', error);
            }
        });

        socket.on('mark_messages_as_read', async ({ chatId, lastReadMessageId, lastReadMessageCreatedAt }) => {
            // console.log('📥 mark_messages_as_read на сервере:', { chatId, lastReadMessageId, lastReadMessageCreatedAt });

            const userId = socket.userId; // тот, кто прочитал
            
            try {
                // обновляем все сообщения в чате, где senderId != userId и status != 'read'
                // обновляем те, что были созданы до lastReadMessageId
                const conversation = await db.mongo.collection('conversations').findOne(
                    { _id: new ObjectId(chatId) }
                );
                if (!userId || !conversation) return;

                await db.mongo.collection('messages').updateMany(
                    { 
                        conversationId: new ObjectId(chatId),
                        senderId: { $ne: Number(userId) }, // Not Equal, $eq Equal
                        status: { $ne: 'read' }, // Not Equal
                        createdAt: { $lte: new Date(lastReadMessageCreatedAt) } // Less Than or Equal
                    },
                    { $set: { status: 'read' } }
                );

                if (String(conversation.lastMessageId) === String(lastReadMessageId)) {
                    await db.mongo.collection('conversations').updateOne(
                        {  _id: new ObjectId(chatId) },
                        { $set: { lastMessageStatus: 'read' } }
                    );
                }
                
                io.to(chatId).emit('messages_read', {
                    chatId: chatId,
                    readerId: userId,
                    lastReadMessageId: lastReadMessageId
                });
            } catch (error) {
                console.error('Ошибка при отметке прочтения:', error);
            }
        });

        socket.on('get_user_status', async (userIds) => {
            console.log('onlineUsers: ', onlineUsers);

            const offlineUsers = [];
            for (const userId of userIds) {
                const onlineUser = onlineUsers.get(String(userId));

                if (onlineUser) {
                    socket.emit('user_status_received', {
                        userId: userId,
                        isOnline: true
                    });
                } else {
                    offlineUsers.push(userId);
                }
            }

            if (offlineUsers.length) {
                try {
                    const result = await (new User).getUsersLastSeenTime(offlineUsers);

                    if (result.length) {
                        result.forEach(user => {
                            socket.emit('user_status_received', {
                                userId: user.id,
                                isOnline: false,
                                lastSeen: user.last_seen_at
                            });
                        });
                    }
                } catch (error) {
                    offlineUsers.forEach(id => {
                        socket.emit('user_status_received', {
                            userId: id,
                            isOnline: false,
                            lastSeen: null
                        });
                    });

                    console.error('Ошибка при получении статуса из БД:', error);
                }
            }
        });

        socket.on('disconnect', async () => {
            if (!socket.userId) return;

            onlineUsers.delete(socket.userId);
            const lastSeen = await (new User).updateUserLastSeenTime(socket.userId);
            
            await emitUserNewStatus(socket, {
                userId: socket.userId,
                isOnline: false,
                lastSeen: lastSeen
            });

            console.log('🔴 Пользователь отключился:', socket.id);
            console.log('🔴 onlineUsers обновлен:', Array.from(onlineUsers.keys()));
        });
    });

    async function emitUserNewStatus(socket, user) {
        const userChats = await (new Chat).getChatList(Number(user.userId));
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