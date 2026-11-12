export interface iChatState {
	chatList: Array<any>,
	currentChat: Record<string, any>,
	currentChatMessages: Array<any>,
	searchedChats: Array<any>,
	searchErrors: Array<any>,
	defaultChatImg: string
}

export interface iChatStore {
	state: iChatState,
	setCurrentChat: (chat:Record<string, any>) => void,
	setCurrentChatMessages: (messages:Array<any>) => void,
	addNewMessageToList: (message:Record<string, any>) => void,
	updateChatList: (message:Record<string, any>) => void,
	setChatList: (chats: Array<any>) => void,
	clearCurrentChat: () => void,
	clearAllChats: () => void,
	clearSearchedChats: () => void,
	findChats: (name: string) => void
}