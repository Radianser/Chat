import crypto from 'crypto';

export const generateCsrfToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

export const setCsrfToken = (req, res, next) => {
    if (!req.session.csrf_token) {
        req.session.csrf_token = generateCsrfToken();
        console.log('🪙 CSRF токен создан:', req.session.csrf_token.substring(0, 10) + '...');
    }
    next();
}

export default setCsrfToken;