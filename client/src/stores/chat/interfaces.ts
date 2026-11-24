export interface iChatState {
	chatList: Record<string, any>[],
	currentChat: Record<string, any>,
	currentChatMessages: Record<string, any>[],
	searchedChats: Record<string, any>[],
	searchErrors: Array<string>,
	defaultChatImg: string
}

export interface iChatStore {
	state: iChatState,
	setCurrentChat: (chat: Record<string, any>) => void,
	setCurrentChatMessages: (messages: Record<string, any>[]) => void,
	addNewMessageToCurrentChat: (message: Record<string, any>) => void,
	updateChatLastMessage: (message: Record<string, any>) => void,
	updateChatLastMessageStatus: (chats: Record<string, any>[]) => void,
	updateChatList: (message: Record<string, any>) => void,
	addNewChat: (chat: Record<string, any>) => void,
	setChatList: (chats: Record<string, any>[]) => void,
	clearCurrentChat: () => void,
	clearAllChats: () => void,
	clearSearchedChats: () => void,
	findChats: (name: string) => void,
	clearUnreadIndicator: (chatId: string) => void
}