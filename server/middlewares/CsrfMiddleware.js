import crypto from 'crypto';

// Генерация криптографически безопасного токена
export const generateCsrfToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

// Middleware для установки CSRF токена в сессию
export const setCsrfToken = (req, res, next) => {
    // Генерируем токен, только если его нет или он пустой
    if (!req.session.csrf_token || req.session.csrf_token === '') {
        req.session.csrf_token = generateCsrfToken();
        console.log('🪙 CSRF токен создан:', req.session.csrf_token.substring(0, 10) + '...');
    }
    next();
};

// Middleware для проверки CSRF токена
export const verifyCsrfToken = (req, res, next) => {
    const token = req.headers['x-csrf-token'] || req.body._csrf;
    
    console.log('🛡️ Проверка CSRF:');
    console.log('  - Токен из запроса:', token ? token.substring(0, 10) + '...' : 'ОТСУТСТВУЕТ');
    console.log('  - Токен в сессии:', req.session.csrf_token ? req.session.csrf_token.substring(0, 10) + '...' : 'ОТСУТСТВУЕТ');
    
    if (!token || !req.session.csrf_token || token !== req.session.csrf_token) {
        console.log('  - ❌ Токены НЕ совпадают!');
        return res.status(403).json({ 
            error: 'Invalid CSRF token',
            message: 'CSRF token validation failed'
        });
    }
    
    console.log('  - ✅ Токены совпадают');
    // После успешной проверки генерируем новый токен
    req.session.csrf_token = generateCsrfToken();
    next();
};

// Добавьте default export для совместимости
export default verifyCsrfToken;