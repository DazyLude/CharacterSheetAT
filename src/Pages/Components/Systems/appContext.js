import { createContext, useReducer, useEffect } from 'react';
import { listen } from '@tauri-apps/api/event';

export const initialContext = {
    readOnly: false,
    isLayoutLocked: true,
    isEditingElements: false,
}


export function contextReducer(state, action) {
    const newState = {...state};
    switch (action.type) {
        case "readOnly-switch":
            newState.readOnly = !state.readOnly;
            break;
        case "layoutEdit-switch":
            newState.isLayoutLocked = !state.isLayoutLocked;
            break;
        case "elementEdit-switch":
            newState.isEditingElements = !state.isEditingElements;
            break;
        default:
            break;
    }
    return newState;
}

export const EditorContext = createContext(null);
export const EditorDispatchContext = createContext(null);

export function EditorContextProvider({children}) {
    const [context, contextDispatcher] = useReducer(contextReducer, initialContext);

    useEffect( // requests data and subscribes to changes
        () => {
            const onEvent = (e) => {
                const data = e.payload;
                contextDispatcher({type: data});
            }

            const unlisten = listen("change_context", onEvent);
            return () => {
                unlisten.then(f => f());
            };
        },
        []
    )

    return (
        <EditorContext.Provider value={context}>
            <EditorDispatchContext.Provider value={contextDispatcher}>
                {children}
            </EditorDispatchContext.Provider>
        </EditorContext.Provider>
    );
}