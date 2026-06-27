import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        babel({ presets: [reactCompilerPreset()] })
    ],
    server: {
        port: 5173,
        proxy: {
            '/api': {
                target: 'http://localhost:3000', // Перенаправляет запросы /api на бэкенд
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, ''), // отрезаем api перед отправкой
                // Важно: не проксировать WebSocket'ы
                ws: false
            }
        }
    },
    resolve: {
        alias: {
            '@src': path.resolve(__dirname, './src'),
            '@assets': path.resolve(__dirname, './src/assets'),
            '@pages': path.resolve(__dirname, './src/pages'),
            '@components': path.resolve(__dirname, './src/components'),
            '@stores': path.resolve(__dirname, './src/stores'),
            '@api': path.resolve(__dirname, './src/api')
        }
    },
})
