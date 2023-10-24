import { HashRouter, Route, Routes } from 'react-router-dom';

import CharacterSheet from './Pages/CharacterSheet';
import ConfigPage from './Pages/ConfigPage';

import { AppContextProvider } from './Pages/Components/Systems/appContext';

function App() {
    return (
        <HashRouter>
            <AppContextProvider>
                <Routes>
                    <Route path="/" element={<CharacterSheet />} />
                    <Route path="/config" element={<ConfigPage />} />
                </Routes>
            </AppContextProvider>
        </HashRouter>
    );
}

export default App;
