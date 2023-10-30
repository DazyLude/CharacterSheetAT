import { BrowserRouter, Route, Routes } from 'react-router-dom';

import CharacterSheet from './Pages/CharacterSheet';
import ConfigPage from './Pages/ConfigPage';

import { AppContextProvider } from './Pages/Components/Systems/appContext';

function App() {
    return (
        <BrowserRouter>
            <AppContextProvider>
                <Routes>
                    <Route path="/" element={<ConfigPage />} />
                    <Route path="/editor" element={<CharacterSheet />} />
                    <Route path="/config" element={<ConfigPage />} />
                </Routes>
            </AppContextProvider>
        </BrowserRouter>
    );
}

export default App;
