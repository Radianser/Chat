import { defineConfig, loadEnv } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import path from 'path'
import svgr from 'vite-plugin-svgr'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
    // Загружаем .env из корня проекта ('../' — как в envDir)
    const env = loadEnv(mode, path.resolve(__dirname, '../'), '');

    return {
        plugins: [
            react(),
            babel({ presets: [reactCompilerPreset()] }),
            svgr(),
        ],
        envDir: '../',
        server: {
            host: true,
            port: Number(env.VITE_WEB_CLIENT_PORT),
            proxy: {
                '/api': {
                    target: env.VITE_WEB_SERVER_URL,
                    changeOrigin: true,
                    rewrite: (p) => p.replace(/^\/api/, ''),
                    ws: false,
                },
                '/resources': {
                    target: env.VITE_WEB_SERVER_URL,
                    changeOrigin: true,
                    // rewrite не нужен, так как путь /resources совпадает
                },
                '/socket.io': {
                    target: env.VITE_WEB_SERVER_URL,
                    ws: true, // Включаем WebSocket
                    changeOrigin: true,
                }
            },
        },
        resolve: {
            alias: {
                '@src': path.resolve(__dirname, './src'),
                '@assets': path.resolve(__dirname, './src/assets'),
                '@pages': path.resolve(__dirname, './src/pages'),
                '@components': path.resolve(__dirname, './src/components'),
                '@stores': path.resolve(__dirname, './src/stores'),
                '@api': path.resolve(__dirname, './src/api'),
                '@utils': path.resolve(__dirname, './src/utils'),
                '@hooks': path.resolve(__dirname, './src/hooks'),
                '@socket': path.resolve(__dirname, './src/socket'),
            },
        },
    };
});
