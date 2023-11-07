use std::path::PathBuf;
use std::sync::Mutex;
use serde_json::{ Map, Value };
use tauri::{ AppHandle, Manager };

use crate::{
    character_data::{CharacterData, CharacterDataCommand},
    disk_interactions::load_json_from_disk,
    ipc::{ load_data, ChangeJSON },
};

pub mod json_file;
pub mod loaded_shortcuts;

pub fn app_state_to_recovery_string(app_handle: &AppHandle) -> String {
    let app_state = app_handle.state::<json_file::JSONFile>();
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
    let app_state = app_handle.state::<json_file::JSONFile>();
    app_state.set_path(p);
    app_state.set_data(v);
    app_state.remove_not_saved_flag();
}

pub fn change_character_data(file: &json_file::JSONFile, change: ChangeJSON) -> Result<(), String> {
    let command = CharacterDataCommand::from_change_json(file.get_data(), change);
    file.change_data(command)
}

pub struct GridGhost {
    style: Mutex<Map<String, Value>>,
    active_window: Mutex<String>,
}

impl GridGhost {
    pub fn new() -> GridGhost {
        GridGhost {
            style: Mutex::from(Map::new()),
            active_window: Mutex::from("".to_string()),
        }
    }

    pub fn set_new_style(&self, new_style: Map<String, Value>, window: String) {
        *self.active_window.lock().unwrap() = window;
        *self.style.lock().unwrap() = new_style;
    }

    pub fn append_to_style(&self, addition: Map<String, Value>, window: String) {
        if *self.active_window.lock().unwrap() != window {
            return;
        }
        let mut old_style = self.style.lock().unwrap().clone();
        old_style.append(&mut addition.clone());
        self.set_new_style(old_style, window)
    }

    pub fn get_style(&self) -> Map<String, Value> {
        self.style.lock().unwrap().clone()
    }

    pub fn set_window(&self, window: String) {
        *self.active_window.lock().unwrap() = window;
    }

    pub fn get_window(&self) -> String {
        self.active_window.lock().unwrap().clone()
    }
}