import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { iOrderState, iOrderStore } from '@src/stores/user/interfaces';

export const useUserStore = create(
	immer<iOrderStore>((set, get) => ({
		// Наше состояние (State)
		state: {
			items: [],
			deliveryAddress: '',
			isSubmitting: false,
		},

		// Изменение адреса (Action)
		updateAddress: (newAddress: string) =>
			set((store: iOrderStore) => {
				store.state.deliveryAddress = newAddress // Прямая мутация, как в Vue!
			}),

		// Добавление товара (Action)
		addItem: (product: iOrderState['items'][number]) =>
			set((store: iOrderStore) => {
				store.state.items.push(product)
			}),

		// Очистка заказа (Action)
		resetOrder: () =>
			set((store: iOrderStore) => {
				store.state.items = []
				store.state.deliveryAddress = ''
			}),

		// Асинхронный экшен для отправки на сервер
		submitOrder: async () => {
			// get() позволяет прочитать текущее состояние
			const currentOrder = get().state

			set((store: iOrderStore) => { store.state.isSubmitting = true })

			try {
				const response = await fetch('https://example.com', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(currentOrder),
				})

				if (response.ok) {
					get().resetOrder() // Вызываем другой экшен внутри хранилища
					alert('Заказ успешно оформлен!')
				}
			} catch (error) {
				console.error('Ошибка при отправке:', error)
			} finally {
				set((store: iOrderStore) => { store.state.isSubmitting = false })
			}
		},
	}))
)