pub mod character_data;
pub mod ipc;
pub mod disk_interactions;
pub mod app_state;

pub mod menu {
    use tauri::{ CustomMenuItem, Menu, Submenu, WindowMenuEvent, Manager, State };
    use tauri::api::dialog::FileDialogBuilder;
    use crate::disk_interactions::load_json_from_disk;
    use crate::app_state::{JSONFile, set_json_file};
    use crate::character_data::CharacterData;
    use crate::ipc::load_data;

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

    pub fn menu_handler (event: WindowMenuEvent) {
        match event.menu_item_id() {
            "open" => {
                open_character_sheet(event.window().clone());
            }
            "log" => {
                let handle = event.window().app_handle();
                let state = handle.state::<JSONFile>();
                println!("{:?}", *state.data.lock().unwrap());
            }
            "save" => {
                let _ = save_character_sheet(event.window().app_handle().state::<JSONFile>());
            }
            "save as" => {
                save_as_character_sheet(event.window().clone());
            }
            "new" => {
                let app_handle = event.window().app_handle();
                let v = CharacterData::generate_empty();
                let p = "".into();
                set_json_file(&app_handle, v, p);
                let _ = load_data(&app_handle);
            }
            e => println!("Got an unimplemented menu event with id: {:?}", e),
        }
    }

    fn open_character_sheet(window: tauri::Window) {
        FileDialogBuilder::new().pick_file(move |file_path| {
            let app_handle = window.app_handle();
            match file_path {
                Some(p) => {
                    let v = match load_json_from_disk(&p) {
                        Ok(d) => d,
                        Err(e) => {
                            println!("{}", e.to_string());
                            return;
                        },
                    };
                    set_json_file(&app_handle, v.into(), p);
                },
                None => return, // path was not provided by the user, we can just exit
            };

            let _ = load_data(&app_handle);
            window.set_focus().unwrap();
        });
    }

    fn save_character_sheet(app_state: State<JSONFile>) -> Result<(), String> {
        let path = app_state.path.lock().unwrap().clone();
        let data = serde_json::to_string(&app_state.data.lock().unwrap().as_value()).unwrap();
        if path.to_str() == Some("") {return Ok(());}

        match std::fs::write(&path, &data) {
            Err(e) => return Err(e.to_string()),
            Ok(_) => return Ok(()),
        };
    }

    fn save_as_character_sheet(window: tauri::Window) {
        FileDialogBuilder::new().save_file(move |file_path| {
            let app = &window.app_handle();
            let data = app.state::<JSONFile>().data.lock().unwrap().as_value();
            let data = serde_json::to_string(&data).unwrap();
            match file_path {
                Some(p) => {
                    match std::fs::write(&p, &data) {
                        Err(_e) => {},
                        Ok(_) => *app.state::<JSONFile>().path.lock().unwrap() = p,
                    };
                },
                None => return, // path was not provided by the user, we can just exit
            };

            window.set_focus().unwrap();
        });
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