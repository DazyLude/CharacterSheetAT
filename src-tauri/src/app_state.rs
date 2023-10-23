use std::path::PathBuf;
use std::sync::Mutex;
use tauri::{ AppHandle, Manager };

use crate::{
    character_data::CharacterData,
    disk_interactions::load_json_from_disk,
    ipc::load_data,
};

pub struct JSONFile {
    pub data: Mutex<CharacterData>,
    pub path: Mutex<PathBuf>,
}

impl JSONFile {
    pub fn new() -> JSONFile {
        let empty_path: PathBuf = "".into();
        JSONFile {
            data: Mutex::from(CharacterData::generate_empty()),
            path: Mutex::from(empty_path),
        }
    }

    pub fn set_empty(&mut self) {
        let empty_path: PathBuf = "".into();
        self.data = Mutex::from(CharacterData::generate_empty());
        self.path = Mutex::from(empty_path);
    }
}

pub fn app_state_to_recovery_string(app_handle: &AppHandle) -> String {
    let app_state = app_handle.state::<JSONFile>();
    let open_file_path: PathBuf = app_state.path.lock().unwrap().clone();
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

    set_json_file(&app_handle, v.into(), path);

    let _ = load_data(app_handle);
}

pub fn set_json_file(app_handle: &AppHandle, v: CharacterData, p: PathBuf) {
    let app_state = app_handle.state::<JSONFile>();
    *app_state.path.lock().unwrap() = p;
    *app_state.data.lock().unwrap() = v;
}