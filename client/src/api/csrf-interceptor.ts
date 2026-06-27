import axios from "axios";
import { getCsrfToken, refreshCsrfToken } from "./csrf";

// Добавляем перехватчик запросов
axios.interceptors.request.use(async (config) => {
    const method = config.method?.toUpperCase() || 'GET';
    
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
        const token = await getCsrfToken();
        config.headers['x-csrf-token'] = token;
    }
    
    config.withCredentials = true;
    return config;
});

// Добавляем перехватчик ответов
axios.interceptors.response.use(
    async (response) => {

//         const method = response.config.method?.toUpperCase() || 'GET';
//         if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
//             await refreshCsrfToken();
//         }
        
        return response;
    },
    async (error) => {
        if (error.response?.status === 403) {
            const method = error.config.method?.toUpperCase() || 'GET';
            
            if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
                console.log(error.config);
                const newToken = await refreshCsrfToken(true);
                error.config.headers['x-csrf-token'] = newToken;
                return axios(error.config);
            }
        }
        
        return Promise.reject(error);
    }
);