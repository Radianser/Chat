import crypto from 'crypto';

export const generateCsrfToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

export const setCsrfToken = (req, res, next) => {
    if (!req.session.csrf_token || req.session.csrf_token === '') {
        req.session.csrf_token = generateCsrfToken();
        console.log('🪙 CSRF токен создан:', req.session.csrf_token.substring(0, 10) + '...');
    }
    next();
};

export const verifyCsrfToken = (req, res, next) => {
    const token = req.headers['x-csrf-token'] || req.body._csrf;
    
    if (!token || !req.session.csrf_token || token !== req.session.csrf_token) {
        console.log('  - ❌ Токены НЕ совпадают!');

        return res.status(403).json({ 
            error: 'Invalid CSRF token',
            message: 'CSRF token validation failed'
        });
    }
    console.log('  - ✅ Токены совпадают');
    
    next();
};

export default verifyCsrfToken;