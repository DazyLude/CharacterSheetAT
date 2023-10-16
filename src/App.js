import { HashRouter, Route, Routes } from 'react-router-dom';

import CharacterSheet from './Pages/CharacterSheet';
import ConfigPage from './Pages/ConfigPage';

import { AppContextProvider } from './Pages/Components/Systems/appContext';
import { CommanderProvider } from './Pages/Components/Systems/command';

function App() {
    return (
        <HashRouter>
            <AppContextProvider>
                <CommanderProvider>
                    <Routes>
                        <Route path="/" element={<CharacterSheet />} />
                        <Route path="/config" element={<ConfigPage />} />
                    </Routes>
                </CommanderProvider>
            </AppContextProvider>
        </HashRouter>
    );
}

export default App;
