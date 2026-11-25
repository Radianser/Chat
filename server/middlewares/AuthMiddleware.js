export const AuthMiddleware = (req, res, next) => {
    // сделать нормальную проверку
    const isAuthorized = true;

    if (isAuthorized) {
        console.log(`[${new Date().toLocaleString()}] Запрос на: ${req.url}`);
        next();
    } else {
        res.status(401).send('У вас нет доступа. Пожалуйста, войдите в систему.');
    }
};