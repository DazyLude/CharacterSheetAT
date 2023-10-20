pub mod character_data;

pub mod app_state {
    use std::path::PathBuf;
    use std::sync::Mutex;

    use crate::character_data::CharacterData;

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
}

pub mod ipc {
    use serde_json::{Value, Map};
    use tauri::Manager;
    use crate::app_state::JSONFile;
    use crate::character_data::CharacterData;

    #[derive(Clone, serde::Serialize, serde::Deserialize)]
    pub struct PayloadJSON {
        pub data: Value,
    }

    #[derive(Clone, Debug, serde::Serialize, serde::Deserialize)]
    pub struct ChangeJSON {
        pub value_type: String,
        pub id: Option<String>,
        pub value_name: Option<String>,
        pub new_value: Option<Value>,
        pub merge_object: Option<Map<String, Value>>,
    }

    pub fn apply_change(change: ChangeJSON, data: &mut CharacterData) -> Result<(), String> {
        let err_change = change.clone();
        if let Some(merge) = change.merge_object {
            match change.value_type.as_str() {
                "global" => {
                    if let Some(v_n) = change.value_name {
                        data.merge_global(v_n, merge);
                        return Ok(());
                    }
                },
                "grid" => {
                    if let Some(id) = change.id {
                        data.merge_grid(id, merge);
                        return Ok(());
                    }
                },
                "element" => {
                    if let Some(id) = change.id {
                        data.merge_element(id, merge);
                        return Ok(());
                    }
                },
                "element-set" => {
                    if let (Some(id), Some(item_name)) = (change.id, change.value_name) {
                        data.merge_with_set_item(id, item_name, merge);
                        return Ok(());
                    }
                },
                _ => {}
            }
        }
        else {
            match change.value_type.as_str() {
                "global" => {
                    if let (Some(v_n), Some(n_v)) = (change.value_name, change.new_value)  {
                        data.edit_global(v_n, n_v);
                        return Ok(());
                    }
                },
                "grid" => {
                    if let (Some(id), Some(v_n), Some(n_v)) = (change.id, change.value_name, change.new_value)  {
                        data.edit_grid(id, v_n, n_v);
                        return Ok(());
                    }
                },
                "element" => {
                    if let (Some(id), Some(v_n), Some(n_v)) = (change.id, change.value_name, change.new_value)  {
                        data.edit_element(id, v_n, n_v);
                        return Ok(());
                    }
                },
                "remove" => {
                    if let Some(id) = change.id {
                        data.remove_by_id(id);
                        return Ok(());
                    }
                }
                "element-set" => {
                    if let (Some(id), Some(v_n), Some(n_v)) = (change.id, change.value_name, change.new_value)  {
                        data.add_to_set(id, v_n, n_v);
                        return Ok(());
                    }
                },
                "remove-set" => {
                    if let (Some(id), Some(name)) = (change.id, change.value_name) {
                        data.remove_from_set(id, name);
                        return Ok(());
                    }
                },
                _ => {},
            }
        }
        Err(format!("ill formed changeJSON: {:?}", err_change))
    }

    pub fn load_data(app_handle: &tauri::AppHandle) -> Result<(), String> {
        let data = app_handle.state::<JSONFile>().data.lock().unwrap().as_value();
        app_handle
            .emit_all("new_character_sheet", PayloadJSON { data } )
            .unwrap_or_else(|error|
                app_handle.trigger_global("error", Some(error.to_string()))
            );
        Ok(())
    }

}

pub mod menu {
    use tauri::{ CustomMenuItem, Menu, Submenu };

    pub fn generate_app_menu() -> Menu {
        let file_menu = Menu::new()
            .add_item(CustomMenuItem::new("new", "New"))
            .add_item(CustomMenuItem::new("save", "Save"))
            .add_item(CustomMenuItem::new("save as", "Save As"))
            .add_item(CustomMenuItem::new("open", "Open"));
        let file_submenu = Submenu::new("File", file_menu);

        Menu::new()
            .add_submenu(file_submenu)
            .add_item(CustomMenuItem::new("log", "Log"))
    }
}

pub mod disk_interactions {
    use crate::app_state::JSONFile;
    use crate::ipc::{PayloadJSON, load_data};
    use tauri::{AppHandle, Manager};
    use serde_json::Value;
    use std::fs::File;
    use std::io::{ BufReader, Read };
    use std::path::PathBuf;

    pub fn save_startup_data(app_handle: &AppHandle) {
        let data_dir_path = match app_handle.path_resolver().app_data_dir() {
            Some(p) => p,
            None => return,
        };
        let appdata_file_path = data_dir_path.join::<PathBuf>("startup.cfg".into());
        let app_state = app_handle.state::<JSONFile>();
        let open_file_path: PathBuf = app_state.path.lock().unwrap().clone();
        let path_str = open_file_path.as_os_str();
        let data = path_str.to_string_lossy();
        match std::fs::write(&appdata_file_path, &data.as_bytes()) {
            Err(_) => {
                match std::fs::create_dir(data_dir_path) {
                    Err(e) => app_handle.trigger_global("error", Some(e.to_string())),
                    Ok(_) => match std::fs::write(&appdata_file_path, &data.as_bytes()) {
                        Err(e) => app_handle.trigger_global("error", Some(e.to_string())),
                        Ok(_) => return,
                    },
                }
            },
            Ok(_) => return,
        };
    }

    pub fn load_startup_data(app_handle: &AppHandle) {
        let data_dir_path = match app_handle.path_resolver().app_data_dir() {
            Some(p) => p,
            None => return,
        };
        let appdata_file_path = data_dir_path.join::<PathBuf>("startup.cfg".into());
        let file = match File::open(appdata_file_path) {
            Ok(r) => r,
            Err(_) => return,
        };
        let mut saved_path = String::new();
        match BufReader::new(file).read_to_string(&mut saved_path) {
            Ok(_) => {},
            Err(_) => return,
        }
        println!("{saved_path}");
        load_json_from_disk(app_handle, saved_path.into());
    }

    pub fn load_json_from_disk(app_handle: &AppHandle, path: PathBuf) {
        let open_file = |path: &PathBuf| -> Result<File, String> {
            match File::open(path) {
                Ok(f) => Ok(f),
                Err(err) => Err("Failed to open provided file:\n\t".to_string() + &err.to_string()),
            }
        };
        let parse_from_reader = |file: File| -> Result<Value, String> {
            let reader = BufReader::new(file);
            match serde_json::from_reader(reader) {
                Ok(v) => Ok(v),
                Err(err) => Err("Failed to parse provided file:\n\t".to_string() + &err.to_string()),
            }
        };
        let report_error = |message| {
            app_handle.trigger_global("error", Some(message));
        };
        let report_tauri_error = |t_err : tauri::Error| {
            app_handle.trigger_global("error", Some(t_err.to_string()));
        };

        match open_file(&path).and_then(parse_from_reader) {
            Ok(v) => {
                app_handle
                    .emit_all("new_character_sheet", PayloadJSON { data : v.clone() } )
                    .unwrap_or_else(report_tauri_error);
                let app_state = app_handle.state::<JSONFile>();
                *app_state.path.lock().unwrap() = path;
                *app_state.data.lock().unwrap() = v.into();
            },
            Err(err) => report_error(err),
        };
        let _ = load_data(app_handle);
    }

}

pub mod logger {
    pub fn log_tauri_error(event: tauri::Event) {
        match event.payload() {
            Some(payload) => println!("{}", payload),
            None => println!("error happened, somewhere, somehow"),
        }
    }
}