import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { useEffect } from 'react';

import { CharacterSheet, AddElement, RemoveElement } from './Pages';
import { invoke } from '@tauri-apps/api';

function App() {
    useEffect(
        () => {
            const onKeyDown = (e) => {
                if (e.ctrlKey || e.altKey) {
                    invoke('shortcut', { payload: { ctrl_key: e.ctrlKey, alt_key: e.altKey, key_code: e.code } });
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
                <Route path="/editor" element={<CharacterSheet/>} />
                <Route path="/add_element" element={<AddElement/>} />
                <Route path="/remove_element" element={<RemoveElement/>} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
