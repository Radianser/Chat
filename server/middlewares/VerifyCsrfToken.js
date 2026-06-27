import { generateCsrfToken } from './SetCsrfToken.js';

export default function VerifyCsrfToken(req, res, next) {
    const token = req.headers['x-csrf-token'] || req.body._csrf;
    
    console.log('🛡️ Проверка CSRF:');
    console.log('  - Токен из запроса:', token ? token.substring(0, 10) + '...' : 'ОТСУТСТВУЕТ');
    console.log('  - Токен в сессии:', req.session.csrf_token ? req.session.csrf_token.substring(0, 10) + '...' : 'ОТСУТСТВУЕТ');
    
    // тут проверять время жизни токена, если действующий, то сюда, если нет, перегенерировать и отправить такую же ошибку
    if (!token || !req.session.csrf_token || token !== req.session.csrf_token) {
        console.log('  - ❌ Токены НЕ совпадают!');
        return res.status(403).json({ 
            error: 'Invalid CSRF token',
            message: 'CSRF token validation failed'
        });
    }
    
    console.log('  - ✅ Токены совпадают');

    // тут не регенерировать постоянно
    req.session.csrf_token = generateCsrfToken();

    next();
}