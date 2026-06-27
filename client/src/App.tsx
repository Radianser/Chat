import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Main from './pages/Main';
import TestPage from './pages/TestPage';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Main />} />
                <Route path="/test" element={<TestPage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App