use std::path::PathBuf;
use std::sync::Mutex;
use serde_json::{ Map, Value };
use tauri::{ AppHandle, Manager };

use crate::{
    character_data::{CharacterData, CharacterDataCommand},
    disk_interactions::load_json_from_disk,
    ipc::{ load_data, ChangeJSON},
    command::CommandStack,
};

pub struct JSONFile {
    data: Mutex<CharacterData>,
    original: Mutex<CharacterData>,
    path: Mutex<PathBuf>,
    history: Mutex<CommandStack<CharacterDataCommand>>
}

impl JSONFile {
    pub fn new() -> JSONFile {
        let empty_path: PathBuf = "".into();
        JSONFile {
            data: Mutex::from(CharacterData::generate_empty()),
            original: Mutex::from(CharacterData::generate_empty()),
            path: Mutex::from(empty_path),
            history: Mutex::from(CommandStack::new()),
        }
    }

    pub fn get_data(&self) -> CharacterData {
        self.data.lock().unwrap().clone()
    }

    pub fn get_path(&self) -> PathBuf {
        self.path.lock().unwrap().clone()
    }

    pub fn set_path(&self, path: PathBuf) {
        *self.path.lock().unwrap() = path;
    }

    pub fn set_data(&self, data: CharacterData) {
        *self.data.lock().unwrap() = data;
    }

    pub fn change_data(&self, command: CharacterDataCommand) -> Result<(), String> {
        let mut data = self.data.lock().unwrap().clone();
        self.history.lock().unwrap().do_one(command, &mut data)?;
        *self.data.lock().unwrap() = data;
        Ok(())
    }

    pub fn go_back(&self) {
        let mut data = self.get_data();
        self.history.lock().unwrap().undo_one(&mut data);
        self.set_data(data);
    }

    pub fn go_forward(&self) {
        let mut data = self.get_data();
        self.history.lock().unwrap().redo_one(&mut data);
        self.set_data(data);
    }

    pub fn remove_not_saved_flag(&self) {
        *self.original.lock().unwrap() = self.get_data();
    }

    pub fn has_unsaved_chages(&self) -> bool {
        *self.original.lock().unwrap() != *self.data.lock().unwrap()
    }
}

pub fn app_state_to_recovery_string(app_handle: &AppHandle) -> String {
    let app_state = app_handle.state::<JSONFile>();
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
    let app_state = app_handle.state::<JSONFile>();
    app_state.set_path(p);
    app_state.set_data(v);
    app_state.remove_not_saved_flag();
}

pub fn change_character_data(file: &JSONFile, change: ChangeJSON) -> Result<(), String> {
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