// import { verifyCsrfToken } from '#middlewares/CsrfMiddleware.js'; это старый middleware, можно удалить

const routes = [
    {
        path: '/main/',
        method: 'post',
        controller: 'MainController',
        action: 'indexPost',
        // проблема в том, что CsrfMiddleware возвращает много функций, а не одну
        middlewares: ['VerifyCsrfToken', 'UserActivityTracker']
    },
    {
        path: '/target/',
        method: 'post',
        controller: 'MainController',
        action: 'formTarget',
        middlewares: ['VerifyCsrfToken', 'UserActivityTracker']
    },
    {
        // path: '/api/test/',
        path: '/test/',
        method: 'put',
        controller: 'MainController',
        action: 'actionApi',
        middlewares: ['VerifyCsrfToken', 'UserActivityTracker']
    },
    {
        path: '/get-auth-user/',
        method: 'POST',
        controller: 'AuthController',
        action: 'get_auth_user',
        middlewares: ['VerifyCsrfToken', 'UserActivityTracker']
    },
    {
        path: '/authorize-user/',
        method: 'POST',
        controller: 'AuthController',
        action: 'authorize_user',
        middlewares: ['VerifyCsrfToken', 'UserActivityTracker']
    },
    {
        path: '/registrate-user/',
        method: 'POST',
        controller: 'AuthController',
        action: 'registrate_user',
        middlewares: ['VerifyCsrfToken', 'UserActivityTracker']
    },
    {
        path: '/restore-password/',
        method: 'POST',
        controller: 'AuthController',
        action: 'restore_password',
        middlewares: ['VerifyCsrfToken', 'UserActivityTracker']
    },
    {
        path: '/change-password/',
        method: 'POST',
        controller: 'AuthController',
        action: 'change_password',
        middlewares: ['VerifyCsrfToken', 'UserActivityTracker']
    },
    {
        path: '/verify-token/',
        method: 'POST',
        controller: 'AuthController',
        action: 'verify_token',
        middlewares: ['VerifyCsrfToken', 'UserActivityTracker']
    },
    {
        path: '/logout-user/',
        method: 'POST',
        controller: 'AuthController',
        action: 'logout_user',
        middlewares: ['VerifyCsrfToken', 'UserActivityTracker']
    }
];

const controllersCache = new Map();
const middlewaresCache = new Map();
const routeLog = [];
let app = null;

export const initRoutes = async (application) => {
    app = application;
    console.log('🚀 Инициализация роутов на Бэке...');
    
    for (const route of routes) {
        await register(route);
    }

    if (routeLog.length > 0) {
        // Сортируем по алфавиту для удобства (опционально)
        routeLog.sort((a, b) => a.Path.localeCompare(b.Path));
        
        console.log('\n🗺️  Дерево роутов:');
        console.table(routeLog);
        console.log(`✅ Успешно загружено роутов: ${routeLog.length} из ${routes.length}\n`);
    } else {
        console.warn('⚠️ Роуты не найдены.');
    }
};

const register = async (route, basePath = '') => {
    const fullPath = (basePath + (route.path || '')).replace(/\/+/g, '/').replace(/\/+$/, '');
    const methods = Array.isArray(route.method) ? route.method : [route.method];
    
    // 1. Регистрируем текущий роут для каждого метода
    for (const method of methods) {
        await registerRoute({
            ...route,
            path: fullPath,
            method: method.toLowerCase()
        });
    }

    // 2. Рекурсивно регистрируем детей (если есть)
    if (route.children?.length) {
        for (const child of route.children) {
            await register({
                ...child,
                middlewares: [...(route.middlewares || []), ...(child.middlewares || [])]
            }, fullPath);
        }
    }
};

const registerRoute = async (route) => {
	try {
		// 1. Динамический импорт контроллера и создание экземпляра
		if (!controllersCache.has(route.controller)) {
            const ControllerModule = await import(`#controllers/${route.controller}.js`);
			controllersCache.set(route.controller, new ControllerModule.default());
		}

		const controller = controllersCache.get(route.controller);
		const action = controller[route.action].bind(controller); // bind нужен для использования this внутри функции контроллера

		// 2. Динамический импорт мидлваров
		const middlewares = await Promise.all(
			(route.middlewares || []).map(async (name) => {
				if (!middlewaresCache.has(name)) {
                    const MiddlewareModule = await import(`#middlewares/${name}.js`);
					// Сохраняем именно функцию
					middlewaresCache.set(name, MiddlewareModule[name] || MiddlewareModule.default);
				}
				return middlewaresCache.get(name);
			})
		);
		
		if(controller && controller[route.action]) {
			app[route.method](route.path, ...middlewares, action);
		} else {
			console.error(`❌ Ошибка: Метод ${route.action} не найден в контроллере ${route.controller}`);
		}

		routeLog.push({
			Method: route.method.toUpperCase(),
			Path: route.path || '/',
			Controller: `${route.controller}`,
			Action: route.action,
			Middlewares: (route.middlewares || []).join(', ') || '—'
		});
	} catch(error) {
		console.error(`🔥 Ошибка загрузки роута ${route.path}:`, error.message);
	}
}