import { invoke } from '@tauri-apps/api/tauri';

export function getDataFromLocation(location) {
    invoke('getResource', {location})
        .then()
        .catch()
}