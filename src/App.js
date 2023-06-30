import { HashRouter, Route, Routes } from 'react-router-dom';

import CharacterSheet from './Pages/CharacterSheet';
import ConfigPage from './Pages/ConfigPage';

import { AppContext, AppDispatchContext, contextReducer, initialContext } from './Pages/Components/appContext';
import { useReducer } from 'react';

function App() {
  const [context, contextDispatcher] = useReducer(contextReducer, initialContext);
  return (
    <HashRouter>
      <AppContext.Provider value={context}>
        <AppDispatchContext.Provider value={contextDispatcher}>
          <Routes>
            <Route path="/" element={<CharacterSheet />} />
            <Route path="/config" element={<ConfigPage />} />
          </Routes>
        </AppDispatchContext.Provider>
      </AppContext.Provider>
    </HashRouter>
  );
}

export default App;
