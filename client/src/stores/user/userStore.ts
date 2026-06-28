import { create } from 'zustand';
import type { iUserStore } from '@stores/user/interfaces';
import * as api from '@api/rest/auth';

export const useUserStore = create<iUserStore>((set, get) => ({
	state: {
		id: 0,
		name: '',
		email: '',
		create_time: '',
		city_id: '',
		errors: {
			email: [],
			password: [],
			confirm: []
		},
	},
	
	getAuthUser: async () => {
		try {
            const response = await api.getAuthUser();

			set((store) => ({
				state: { ...store.state, ...response.data }
			}))
        } catch (error) {
            console.error('Ошибка запроса:', error);
        }
	},

	authorizeUser: async (formData: FormData) => {
		try {
            const response: any = await api.authorizeUser({
				method: 'POST',
                data: formData
			});

			if (response.data.validated) {
				set((store) => ({
					state: { 
						...store.state, 
						...response.data.user,
						errors: {
							...store.state.errors
						}
					}
				}));
			} else {
				set((store) => ({
					state: { 
						...store.state,
						errors: {
							...store.state.errors,
							...response.data.errors
						}
					}
				}));
			}
        } catch (error) {
            console.error('Ошибка запроса:', error);
        }
	},

	registrateUser: async (formData: FormData) => {
		try {
            const { data } = await api.registrateUser({
				method: 'POST',
                data: formData
			});

			if (Object.keys(data.errors).length) {
				set((store) => ({
					state: {
						...store.state,
						errors: {
							...store.state.errors,
							...data.errors
						}
					}
				}));
			}

			return data;
        } catch (error) {
            console.error('Ошибка запроса:', error);
        }
	},

	verifyToken: async ({ user_id, token }: any) => {
		try {
            const { data }: any = await api.verifyToken({
				method: 'POST',
                data: { 
					user_id,
					token
				}
			});
			return data;
        } catch (error) {
            console.error('Ошибка запроса:', error);
        }
	},

	logoutUser: async () => {
		try {
            const { data }: any = await api.logoutUser({
				method: 'POST',
                data: {}
			});

			if (data.code === 'OK') {
				get().resetUser();
			} else {
				
			}
        } catch (error) {
            console.error('Ошибка запроса:', error);
        }
	},

	clearError: (fieldName: string) => {
		console.log('fieldName: ', fieldName);

		set((store) => {
			// store - это весь iUserStore
			// store.state - это iUserState
			// store.state.errors - это Record<string, string>
			// На русском: "Из объекта ошибок вытащи поле fieldName в переменную removed (она нам не нужна), а всё остальное сложи в restErrors"
			
			const { [fieldName]: removed, ...restErrors } = store.state.errors;
			
			return {
				state: {
					...store.state,
					errors: {
						...restErrors,
						[fieldName]: []
					}
				}
			};
		});
	},

	clearAllErrors: () => {
		set((store) => {
			return {
				state: {
					...store.state,
					errors: {
						email: [],
						password: [],
						confirm: []
					}
				}
			};
		});
	},

	resetUser: () => {
		set(() => ({
			state: {
				id: 0,
				name: '',
				email: '',
				create_time: '',
				city_id: '',
				errors: {},
			}
		}));
	},

	restorePassword: async (formData: FormData) => {
		try {
            const { data } = await api.restorePassword({
				method: 'POST',
                data: formData
			});

			if (Object.keys(data.errors).length) {
				set((store) => ({
					state: {
						...store.state,
						errors: {
							...store.state.errors,
							...data.errors
						}
					}
				}));
			}

			return data;
        } catch (error) {
            console.error('Ошибка запроса:', error);
        }
	},

	changePassword: async (data: FormData) => {
		try {
            const response: any = await api.changePassword({
				method: 'POST',
                data: data
			});

			if (response.data.validated) {
				set((store) => ({
					state: { 
						...store.state, 
						...response.data.user,
						errors: {
							...store.state.errors
						}
					}
				}));
			} else {
				set((store) => ({
					state: { 
						...store.state, 
						errors: {
							...store.state.errors,
							...response.data.errors
						}
					}
				}));
			}

			return response.data;
        } catch (error) {
            console.error('Ошибка запроса:', error);
        }
	},
}))