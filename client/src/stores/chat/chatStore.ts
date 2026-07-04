import { create } from 'zustand';
import type { iChatStore } from '@stores/chat/interfaces';

export const useChatStore = create<iChatStore>((set, get) => ({
	state: {
		userChats: [],
		searchedChats: []
	},

	getUserChats() {
		// request

		console.log("Lets imagine we've done a request");

		let chats = [
			{id: 1, name: 'John', img: '/resources/5.png', message: "hello! wefwefwe wefwe fwef wefw ef wef wef wef", messageTime: 'Jul 3', messageType: 'income', messageStatus: null},
			{id: 2, name: 'Kate', img: null, message: 'bye', messageTime: "Jul 4", messageType: 'income', messageStatus: null},
			{id: 3, name: 'Julia', img: '/resources/6.png', message: "what's up?", messageTime: 'Jul 29', messageType: 'outcome', messageStatus: 'delivered'}
		];


		set(store => ({
			state: {
				...store.state,
				userChats: [
					...store.state.userChats,
					...chats
				]
			}
		}));
	},

	clearAllChats() {
		set(store => ({
			state: {
				...store.state,
				userChats: [],
				searchedChats: []
			}
		}));
	},

	clearSearchedChats() {
		set(store => ({
			state: {
				...store.state,
				searchedChats: []
			}
		}));
	},

	findChats(name: string) {
		// request

		console.log("Lets imagine we've found chats");

		let chats = [
			{id: 4, name: 'Bob', img: '/resources/5.png', message: "agth sefw3 3qr", messageTime: 'Jul 2', messageType: 'income', messageStatus: null},
			{id: 5, name: 'Emma', img: '/resources/6.png', message: "ukj rtyh", messageTime: 'Jun 30', messageType: 'outcome', messageStatus: 'delivered'}
		];


		set(store => ({
			state: {
				...store.state,
				searchedChats: [
					...chats
				]
			}
		}));
	}
}))