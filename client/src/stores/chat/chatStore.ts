import { create } from 'zustand';
import type { iChatStore } from '@stores/chat/interfaces';
import * as api from '@api/rest/chat';

export const useChatStore = create<iChatStore>((set) => ({
	state: {
		chatList: [],
		currentChat: {},
		currentChatMessages: [],
		searchedChats: [],
		searchErrors: [],
		defaultChatImg: '/resources/1.png'
	},

	setChatList(chats: Record<string, any>[]) {
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

	setCurrentChat(chat: Record<string, any>) {
		set(store => ({
			state: {
				...store.state,
				currentChat: chat,
				currentChatMessages: []
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

	setCurrentChatMessages(messages: Record<string, any>[]) {
		set(store => ({
			state: {
				...store.state,
				currentChatMessages: [
					...messages
				]
			}
		}));
	},

	addNewMessageToCurrentChat(message: Record<string, any>) {
		set((store) => {
			const exists = store.state.currentChatMessages.some(
				(msg: any) => String(msg._id) === String(message._id)
			);
			if (exists) return store;

			return {
				state: {
					...store.state,
					currentChat: {
						...store.state.currentChat,
						lastMessage: message.text,
						lastMessageId: message._id,
						lastMessageSender: message.senderId,
						lastMessageStatus: message.status,
						lastMessageCreatedAt: message.createdAt,
					},
					currentChatMessages: [
						...store.state.currentChatMessages,
						message
					]
				}
			};
		});
	},

	updateChatLastMessage(message: Record<string, any>) {
		set((store) => {
			const updatedChats = store.state.chatList.map((chat: any) => {
				if (String(chat._id) === String(message.conversationId)) {
					return {
						...chat,
						lastMessage: message.text,
						lastMessageId: message._id,
						lastMessageSender: message.senderId,
						lastMessageStatus: message.status,
						lastMessageCreatedAt: message.createdAt
					};
				}
				return chat;
			});

			return {
				state: {
					...store.state,
					chatList: updatedChats
				}
			};
		});
	},

	updateChatLastMessageStatus(chats: Record<string, any>[]) {
		set(store => ({
			state: {
				...store.state,
				chatList: chats
			}
		}));
	},

	updateChatList(message: Record<string, any>) {
		set((store) => {
			const updatedChats = store.state.chatList.map((chat: any) => {
				if (String(chat._id) === String(message.conversationId)) {
					let updatedChat = {
						...chat,
						lastMessage: message.text,
						lastMessageId: message._id,
						lastMessageSender: message.senderId,
						lastMessageStatus: message.status,
						lastMessageCreatedAt: message.createdAt
					};

					if (String(chat._id) !== String(store.state.currentChat._id)) {
						updatedChat.unreadCount += 1;
					}

					return updatedChat;
				}
				return chat;
			});

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
	},

	addNewChat(chat: Record<string, any>) {
		set(store => {
			const newChatList = [
				...store.state.chatList,
				{
					...chat,
					unreadCount: 1
				}
			];

			newChatList.sort((a: any, b: any) => {
				const dateA = new Date(a.lastMessageCreatedAt || 0).getTime();
				const dateB = new Date(b.lastMessageCreatedAt || 0).getTime();
				return dateB - dateA;
			});

			return {
				state: {
					...store.state,
					chatList: newChatList
				}
			}
		});
	},

	clearUnreadIndicator(chatId: string) {
		set((store) => {
			const updatedChats = store.state.chatList.map((chat: Record<string, any>) => {
				if (String(chat._id) === String(chatId)) {
					return {
						...chat,
						unreadCount: 0
					};
				}

				return chat;
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