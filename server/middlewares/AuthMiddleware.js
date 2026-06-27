export const AuthMiddleware = (req, res, next) => {
    const isAuthorized = true; // Здесь будет твоя реальная проверка (например, req.session.user)

    if (isAuthorized) {
        console.log(`[${new Date().toLocaleString()}] Запрос на: ${req.url}`);
        next(); // Всё ок, пропускаем к контроллеру
    } else {
        // Если не авторизован — редирект или ошибка
        res.status(401).send('У вас нет доступа. Пожалуйста, войдите в систему.');
        // Или: res.redirect('/login');
    }
};