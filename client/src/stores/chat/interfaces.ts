export interface iChatState {
	userChats: Array<any>,
	currentChat: Record<string, any>,
	searchedChats: Array<any>,
	searchErrors: Array<any>,
	defaultUserImg: string
}

export interface iChatStore {
	state: iChatState,
	setCurrentChat: (chat:Record<string, any>) => void
	getUserChats: () => void,
	clearAllChats: () => void,
	clearSearchedChats: () => void,
	findChats: (name: string) => void
}