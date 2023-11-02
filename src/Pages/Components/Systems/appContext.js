import { createContext, useReducer } from 'react';

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

    return (
        <EditorContext.Provider value={context}>
            <EditorDispatchContext.Provider value={contextDispatcher}>
                {children}
            </EditorDispatchContext.Provider>
        </EditorContext.Provider>
    );
}