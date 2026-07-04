export interface iChatState {
	userChats: Array<any>,
	searchedChats: Array<any>
}

export interface iChatStore {
	state: iChatState,
	getUserChats: () => void,
	clearAllChats: () => void,
	clearSearchedChats: () => void,
	findChats: (name: string) => void
}