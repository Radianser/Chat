let csrfToken:string = '';

// Получаем CSRF токен при старте приложения
export const getCsrfToken = async () => {
    if (csrfToken) return csrfToken;

    try {
        const response = await fetch('/api/csrf-token', {
            credentials: 'include' // Отправляем сессионную куку
        });
        const data = await response.json();
        csrfToken = data.csrfToken;
        return csrfToken;
    } catch (error) {
        console.error('Failed to fetch CSRF token:', error);
        throw error;
    }
};

// Универсальная функция для API запросов
export const apiFetch = async (url:string, options:RequestInit = {}) => {
    // Получаем токен, если его нет
    if (!csrfToken) {
        await getCsrfToken();
    }
    
    const headers = {
        ...options.headers,
        'X-CSRF-Token': csrfToken,
        'Content-Type': 'application/json'
    };
    
    const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include' // Важно для отправки сессионной куки
    });
    
    // Если получили 403, пробуем получить новый токен и повторить запрос
    if (response.status === 403) {
        await getCsrfToken();
        headers['X-CSRF-Token'] = csrfToken;
        
        const retryResponse = await fetch(url, {
            ...options,
            headers,
            credentials: 'include'
        });
        
        // Обновляем токен после успешного запроса
        const newTokenResponse = await fetch('/api/csrf-token', {
            credentials: 'include'
        });
        const newTokenData = await newTokenResponse.json();
        csrfToken = newTokenData.csrfToken;
        
        return retryResponse;
    }
    
    // Обновляем токен после каждого успешного запроса (если сервер его перегенерировал)
    if (response.ok) {
        const newTokenResponse = await fetch('/api/csrf-token', {
            credentials: 'include'
        });
        const newTokenData = await newTokenResponse.json();
        csrfToken = newTokenData.csrfToken;
    }
    
    return response;
};