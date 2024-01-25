import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { Editor, AddElement, Debug } from './Pages';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<></>} />
                <Route path="/editor" element={<Editor/>} />
                <Route path="/add_element" element={<AddElement/>} />
                <Route path="/debug_window" element={<Debug/>} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
