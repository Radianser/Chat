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
		// let chats = [
		// 	{id: 1, name: 'John', img: '/resources/5.png', message: "hello! wefwefwe wefwe fwef wefw ef wef wef wef", messageTime: 'Jul 3', messageType: 'income', messageStatus: null},
		// 	{id: 2, name: 'Kate', img: null, message: 'bye', messageTime: "Jul 4", messageType: 'income', messageStatus: null},
		// 	{id: 3, name: 'Julia', img: '/resources/6.png', message: "what's up?", messageTime: 'Jul 29', messageType: 'outcome', messageStatus: 'delivered'}
		// ];

		set(store => ({
			state: {
				...store.state,
				chatList: chats
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

			console.log('store.state: ', get().state);
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

	setCurrentChatMessages(messages:Record<string, any>) {
		set(store => ({
			state: {
				...store.state,
				currentChatMessages: messages
			}
		}));
	}
}))