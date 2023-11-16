//! Non window specific states should be defined here

use std::path::PathBuf;
use tauri::{ AppHandle, Manager };

use crate::{
    character_data::{CharacterData, CharacterDataCommand},
    disk_interactions::load_json_from_disk,
    ipc::{ event_emitters::load_data, ChangeJSON },
};

use crate::windows::EditorStateSync;
pub mod loaded_shortcuts;

pub fn with_managed_states() -> tauri::Builder<tauri::Wry> {
    tauri::Builder::default()
        .manage(loaded_shortcuts::LoadedShortcuts::get_default())
}

pub fn app_state_to_recovery_string(app_handle: &AppHandle) -> String {
    let app_state = app_handle.state::<EditorStateSync>();
    let open_file_path: PathBuf = app_state.get_path();
    let path_str = open_file_path.as_os_str();
    let data = path_str.to_string_lossy();

    data.to_string()
}

pub fn load_app_state_from_recovery_string(app_handle: &AppHandle, data: &String) {
    let path : PathBuf = data.into();
    let v = match load_json_from_disk(&path) {
        Ok(d) => d,
        Err(_) => return,
    };

    load_json_file(&app_handle, v.into(), path);

    let _ = load_data(app_handle);
}

pub fn load_json_file(app_handle: &AppHandle, v: CharacterData, p: PathBuf) {
    let app_state = app_handle.state::<EditorStateSync>();
    app_state.set_path(p);
    app_state.set_data(v);
    app_state.remove_not_saved_flag();
}

pub fn change_character_data(file: &EditorStateSync, change: ChangeJSON) -> Result<(), String> {
    let command = CharacterDataCommand::from_change_json(file.get_data(), change);
    file.change_data(command)
}