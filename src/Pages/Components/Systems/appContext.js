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

export const AppContext = createContext(null);
export const AppDispatchContext = createContext(null);

export function AppContextProvider({children}) {
    const [context, contextDispatcher] = useReducer(contextReducer, initialContext);

    return (
        <AppContext.Provider value={context}>
            <AppDispatchContext.Provider value={contextDispatcher}>
                {children}
            </AppDispatchContext.Provider>
        </AppContext.Provider>
    );
}