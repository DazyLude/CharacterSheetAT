pub mod character_data;
pub mod ipc;
pub mod disk_interactions;

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


pub mod logger {
    pub fn log_tauri_error(event: tauri::Event) {
        match event.payload() {
            Some(payload) => println!("{}", payload),
            None => println!("error happened, somewhere, somehow"),
        }
    }
}