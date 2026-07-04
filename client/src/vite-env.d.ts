/// <reference types="vite/client" />

declare module '*.svg?react' {
    import React from 'react';
    const SVGComponent: React.FC<React.SVGProps<SVGSVGElement>>;
    export default SVGComponent;
}

// Обычный импорт SVG как строки
declare module '*.svg' {
    const content: string;
    export default content;
}