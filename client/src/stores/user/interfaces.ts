export interface iUserState {
	id: number,
	name: string,
	email: string,
	errors: Record<string, Array<string>> // объект из строк ключ-значение
}

export interface iUserStore {
	state: iUserState,
	getAuthUser: () => Promise<void>,
	authorizeUser: (data: FormData) => void,
	registrateUser: (data: FormData) => void,
	restorePassword: (formData: FormData) => Promise<any>,
	changePassword: (data: FormData) => Promise<any>,

	verifyToken: (params: Object) => Promise<any>,
	resetUser: () => void,
	logoutUser: () => void,
	clearError: (fieldName: string) => void,
	clearAllErrors: () => void
}