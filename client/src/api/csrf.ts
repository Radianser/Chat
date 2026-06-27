import axios from "axios";

let csrfToken: string | null = null;
let csrfPromise: Promise<string> | null = null;

export const getCsrfToken = async (error: boolean = false): Promise<string> => {

    console.log('error: ', error);

    // Если токен уже есть, возвращаем его
    if (csrfToken && !error) return csrfToken;
    
    // Если уже идет запрос токена, ждем его
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
            // csrfPromise = null;
            console.error('❌ Ошибка получения CSRF токена:', error);
            throw error;
        } finally {
            csrfPromise = null;
        }
    })();
    
    return csrfPromise;
};

export const refreshCsrfToken = async (error: boolean = false): Promise<string> => {
    csrfToken = null;
    return await getCsrfToken(error);
};