import axios from "axios";

let csrfToken: string | null = null;
let csrfPromise: Promise<string> | null = null;

// 1. Функция получения токена (без интерсепторов)
export const getCsrfToken = async (forceRefresh = false): Promise<string> => {
    // если токен уже есть, возвращаем его
    if (csrfToken && !forceRefresh) return csrfToken;
    
    // если уже идет запрос токена, ждем его
    if (csrfPromise) return csrfPromise;
    
    // Создаем новый запрос
    csrfPromise = (async (): Promise<string> => {
        try {
            const response = await axios.get<{ csrfToken: string }>('/api/csrf-token', {
                withCredentials: true
            });
            
            const token = response.data.csrfToken;
            
            if (!token) {
                throw new Error('CSRF token is empty');
            }
            
            csrfToken = token;
            console.log('🔑 CSRF токен получен:', token.substring(0, 10) + '...');
            return token;
        } catch (error) {
            console.error('❌ Ошибка получения CSRF токена:', error);
            throw error;
        } finally {
            csrfPromise = null;
        }
    })();
    
    return csrfPromise;
};

export const refreshCsrfToken = async (): Promise<string> => {
    csrfToken = null;
    return getCsrfToken(true);
};

// 2. Интерсептор запросов
axios.interceptors.request.use(async (config) => {
    const method = config.method?.toUpperCase() || 'GET';
    
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
        const token = await getCsrfToken();
        config.headers['x-csrf-token'] = token;
    }
    
    config.withCredentials = true;
    return config;
});

// 3. Интерсептор ответов (с защитой от циклов)
axios.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Если 403 и это не запрос за токеном (чтобы не зациклиться)
        if (
            error.response?.status === 403 &&
            !originalRequest._retry && // ✅ Защита от бесконечного цикла
            originalRequest.url !== '/api/csrf-token' // ✅ Не перехватываем запрос токена
        ) {
            originalRequest._retry = true; // Помечаем, что уже пробовали

            try {
                const newToken = await refreshCsrfToken();
                originalRequest.headers['x-csrf-token'] = newToken;
                return axios(originalRequest); // Повторяем запрос
            } catch (refreshError) {
                console.error('Не удалось обновить CSRF токен:', refreshError);
                return Promise.reject(error);
            }
        }

        return Promise.reject(error);
    }
);