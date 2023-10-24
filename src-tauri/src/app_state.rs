use std::path::PathBuf;
use std::sync::Mutex;
use tauri::{ AppHandle, Manager };

use crate::{
    character_data::{CharacterData, CharacterDataCommand},
    disk_interactions::load_json_from_disk,
    ipc::{ load_data, ChangeJSON},
    command::{CommandStack, Command},
};

pub struct JSONFile {
    data: Mutex<CharacterData>,
    path: Mutex<PathBuf>,
}

pub struct JSONHistory {
    pub history: Mutex<CommandStack<CharacterDataCommand, CharacterData>>
}

impl JSONHistory {
    pub fn new() -> JSONHistory {
        JSONHistory { history: Mutex::from(CommandStack::new()) }
    }
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

    set_json_file(&app_handle, v.into(), path);

    let _ = load_data(app_handle);
}

pub fn set_json_file(app_handle: &AppHandle, v: CharacterData, p: PathBuf) {
    let app_state = app_handle.state::<JSONFile>();
    app_state.set_path(p);
    app_state.set_data(v);
}


pub fn change_character_data(file: &JSONFile, history: &JSONHistory, change: ChangeJSON) -> Result<(), String> {
    let old_data = file.get_data();
    let mut data: CharacterData = file.get_data();
    let err_change = change.clone();
    let op_type = change.value_type.clone();

    let op: Option<()> = match (op_type.as_str(), change.to_data_tuple()) {
        // (value_type, (id, value_name, new_value, merge_object))
        ("grid",        (Some(i), None,    None,    Some(m))) => data.merge_grid(i, m),
        ("grid",        (Some(i), Some(n), Some(v), None   )) => data.edit_grid(i, n, v),
        ("element",     (Some(i), None,    None,    Some(m))) => data.merge_element(i, m),
        ("element",     (Some(i), Some(n), Some(v), None   )) => data.edit_element(i, n, v),
        ("global",      (None,    Some(n), None,    Some(m))) => data.merge_global(n, m),
        ("global",      (None,    Some(n), Some(v), None   )) => data.edit_global(n, v),
        ("element-set", (Some(i), Some(n), None,    Some(m))) => data.merge_with_set_item(i, n, m),
        ("element-set", (Some(i), Some(n), Some(v), None   )) => data.add_to_set(i, n, v),
        ("remove",      (Some(i), None   , None,    None   )) => data.remove_by_id(i),
        ("remove-set",  (Some(i), Some(n), None,    None   )) => data.remove_from_set(i, n),
        (_, _) => None,
    };

    match op {
        Some(_) => {
            let command = CharacterDataCommand::from_old_and_new(old_data, data.clone());
            history.history.lock().unwrap().do_one(command, &mut data);
            file.set_data(data);
            return Ok(());
        },
        None => return Err(format!("ill formed changeJSON: {:?}", err_change)),
    }
}