import { createContext } from 'react';

// Описываем тип данных в контексте
export interface MobileContextType {
    windowWidth: number;
    isChatOpened: boolean;
}

// Описываем, что контекст содержит данные и функцию для их изменения
export interface MobileContextValue {
    ergonomics: MobileContextType;
    setErgonomics: React.Dispatch<React.SetStateAction<MobileContextType>>;
}

// Создаем контекст с дефолтным значением (null или заглушка)
export const MobileContext = createContext<MobileContextValue | null>(null);