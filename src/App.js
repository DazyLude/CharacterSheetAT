import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { useEffect } from 'react';

import { Editor, AddElement, Debug } from './Pages';
import { emit } from '@tauri-apps/api/event';

function App() {
    useEffect(
        () => {
            const onKeyDown = (e) => {
                if (e.ctrlKey || e.altKey) {
                    emit("keypress", { ctrl_key: e.ctrlKey, alt_key: e.altKey, key_code: e.code });
                }
            }
            window.addEventListener("keydown", onKeyDown);
            return () => {window.removeEventListener("keydown", onKeyDown)};
        },
        []
    )

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
