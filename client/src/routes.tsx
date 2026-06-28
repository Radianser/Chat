import { lazy } from 'react';

const Main = lazy(() => import('@pages/main/Main.tsx'));
const ForgotPassword = lazy(() => import('@pages/auth/ForgotPassword.tsx'));
const ChangePassword = lazy(() => import('@pages/auth/ChangePassword.tsx'));
const UserVerification = lazy(() => import('@src/pages/auth/UserVerification'));

const routes = [
    {
        path: '/',
        element: <Main />
    },
    {
        path: '/forgot-password',
        element: <ForgotPassword />
    },
    {
        path: '/change-password/:id/:token',
        element: <ChangePassword />
    },
    {
        path: '/verification/:id/:token',
        element: <UserVerification />
    },
];

export default routes;