export interface iChatState {
	chatList: Array<any>,
	currentChat: Record<string, any>,
	currentChatMessages: Record<string, any>,
	searchedChats: Array<any>,
	searchErrors: Array<any>,
	defaultChatImg: string
}

export interface iChatStore {
	state: iChatState,
	setCurrentChat: (chat:Record<string, any>) => void,
	setCurrentChatMessages: (messages:Record<string, any>) => void,
	setChatList: (chats: Array<any>) => void,
	clearAllChats: () => void,
	clearSearchedChats: () => void,
	findChats: (name: string) => void
}