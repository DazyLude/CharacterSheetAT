import { createContext } from 'react';

export const AppContext = createContext(null)
export const AppDispatchContext = createContext(null)

export const initialContext = {
    readOnly: false,
    isLayoutLocked: true,
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
        default:
            break;
    }
    return newState;
}