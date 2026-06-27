// import { loader as verificationLoader } from '@pages/verification/loader.tsx';
// import type { LoaderFunctionArgs, ActionFunctionArgs } from 'react-router-dom';
import type { LoaderFunctionArgs } from 'react-router-dom';

const routes = [
    {
        path: '/',
        // loader: listLoader,
        // action: listAction,
        lazy: async () => {
            const module = await import('@pages/main/Main.tsx');
            return { Component: module.default };
        }
    },
    {
        path: '/forgot-password',
        // loader: editLoader,
        // action: editAction,
        lazy: async () => {
            const module = await import('@pages/auth/ForgotPassword.tsx');
            return { Component: module.default };
        }
    },
    {
        path: '/change-password/:id/:token',
        // loader: editLoader,
        // action: editAction,
        loader: ({ params }: LoaderFunctionArgs) => ({ id: params.id, token: params.token }),
        lazy: async () => {
            const module = await import('@pages/auth/ChangePassword.tsx');
            return { Component: module.default };
        }
    },
    {
        path: '/verification/:id/:token',
        // loader: await import('@pages/verification/loader.tsx'),
        // loader: verificationLoader,
        // action: editAction,
        loader: ({ params }: LoaderFunctionArgs) => ({ id: params.id, token: params.token }),
        lazy: async () => {
            const module = await import('@src/pages/auth/UserVerification');
            return { Component: module.default };
        }
    },
];

export default routes;