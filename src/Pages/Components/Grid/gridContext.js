import { createContext } from 'react';
import { defaultLayout, changeField } from '../../Utils';

export const GridContext = createContext(null);
export const GridContextReducer = createContext(null);

export const initialGridContext = defaultLayout;

export function gridContextReducer(state, action) {
    return changeField(state, action.merge, action.id);
}
