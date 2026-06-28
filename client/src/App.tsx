import { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import routes from './routes.tsx';
import { useUserStore } from '@src/stores/user/userStore';
import './App.css';

declare global {
  interface Window {
    userState?: any;
  }
}

function App() {
    const state = useUserStore((state) => state.state);
    window.userState = state;

    return (
        <BrowserRouter>
            <Suspense fallback={
                <div className='loader-wrapper'>
                    <span className="loader"></span>
                </div>
            }>
                <Routes>
                    {routes.map((route) => (
                        <Route 
                            key={route.path}
                            path={route.path} 
                            element={route.element} 
                        />
                    ))}
                </Routes>
            </Suspense>
        </BrowserRouter>
    );
}

export default App