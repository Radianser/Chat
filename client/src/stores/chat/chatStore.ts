import { create } from 'zustand';
import type { iChatStore } from '@stores/chat/interfaces';
import * as api from '@api/rest/chat';

export const useChatStore = create<iChatStore>((set, get) => ({
	state: {
		chatList: [],
		currentChat: {},
		currentChatMessages: [],
		searchedChats: [],
		searchErrors: [],
		defaultChatImg: '/resources/1.png'
	},

	setChatList(chats) {
		const updatedChats = chats.sort((a: any, b: any) => {
			const dateA = new Date(a.lastMessageCreatedAt || 0).getTime();
			const dateB = new Date(b.lastMessageCreatedAt || 0).getTime();
			return dateB - dateA;
		});

		set(store => ({
			state: {
				...store.state,
				chatList: updatedChats
			}
		}));
	},

	clearCurrentChat() {
		set(store => ({
			state: {
				...store.state,
				currentChat: {}
			}
		}));
	},

	clearAllChats() {
		set(store => ({
			state: {
				...store.state,
				chatList: [],
				searchedChats: [],
				searchErrors: []
			}
		}));
	},

	clearSearchedChats() {
		set(store => ({
			state: {
				...store.state,
				searchedChats: [],
				searchErrors: []
			}
		}));
	},

	async findChats(name: string) {
		if (name.length < 2) return;

		try {
			const { data } = await api.findChats({
				method: 'POST',
				data: {
					string: name
				}
			});

			if (data.chats.length && !data.errors.length) {
				set(store => ({
					state: {
						...store.state,
						searchedChats: [
							...data.chats
						],
						searchErrors: []
					}
				}));
			} else {
				set(store => ({
					state: {
						...store.state,
						searchedChats: [],
						searchErrors: [
							...data.errors
						]
					}
				}));
			}

			// console.log('store.state: ', get().state);
		} catch (error) {
			console.error('Ошибка запроса:', error);
		}
	},

	setCurrentChat(chat:Record<string, any>) {
		set(store => ({
			state: {
				...store.state,
				currentChat: chat,
				currentChatMessages: []
			}
		}));
	},

	setCurrentChatMessages(messages:Array<any>) {
		set(store => ({
			state: {
				...store.state,
				currentChatMessages: [
					...messages
				]
			}
		}));
	},

	addNewMessageToList(message: Record<string, any>) {
		console.log('new client incoming message: ', message);

		set((store) => {
			// if (!store.state.currentChat._id && message.conversationId) {
			// 	store.state.setCurrentChat({ 
			// 		...store.state.currentChat, 
			// 		_id: message.conversationId 
			// 	});
			// }

			// 1. Проверяем, что сообщение относится к текущему чату
			if (String(message.conversationId) !== String(store.state.currentChat._id)) {
				return store;
			}

			// 2. Проверяем на дубликат
			const exists = store.state.currentChatMessages.some(
				(msg: any) => String(msg._id) === String(message._id)
			);
			if (exists) return store;

			// 3. Добавляем в конец
			return {
				state: {
					...store.state,
					currentChatMessages: [
						...store.state.currentChatMessages,
						message
					]
				}
			};
		});
	},

	updateChatList(message: Record<string, any>) {
		set((store) => {
			// 1. Находим чат в списке по conversationId
			const updatedChats = store.state.chatList.map((chat: any) => {
				if (String(chat._id) === String(message.conversationId)) {
					// 2. Обновляем превью
					return {
						...chat,
						lastMessage: message.text,
						lastMessageSender: message.senderId,
						lastMessageStatus: message.status,
						lastMessageCreatedAt: message.createdAt
					};
				}
				return chat;
			});

			// 3. Сортируем по дате последнего сообщения (сначала новые)
			updatedChats.sort((a: any, b: any) => {
				const dateA = new Date(a.lastMessageCreatedAt || 0).getTime();
				const dateB = new Date(b.lastMessageCreatedAt || 0).getTime();
				return dateB - dateA;
			});

			return {
				state: {
					...store.state,
					chatList: updatedChats
				}
			};
		});
	}
}))