use tauri::{ CustomMenuItem, Menu, Submenu, WindowMenuEvent, Manager, State };
use tauri::api::dialog::FileDialogBuilder;
use crate::disk_interactions::load_json_from_disk;
use crate::app_state::{JSONFile, load_json_file};
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
        .add_item(CustomMenuItem::new("undo", "Undo"))
        .add_item(CustomMenuItem::new("redo", "Redo"))
}

pub fn menu_handler (event: WindowMenuEvent) {
    match event.menu_item_id() {
        "open" => {
            open_character_sheet(event.window().clone());
        }
        "log" => {
            let handle = event.window().app_handle();
            let state = handle.state::<JSONFile>();
            println!("{:?}", state.get_data());
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
            load_json_file(&app_handle, v, p);
            let _ = load_data(&app_handle);
        }
        "undo" => {
            let app_handle = event.window().app_handle();
            app_handle.state::<JSONFile>().go_back();
            let _ = load_data(&app_handle);
        }
        "redo" => {
            let app_handle = event.window().app_handle();
            app_handle.state::<JSONFile>().go_forward();
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
                load_json_file(&app_handle, v.into(), p);
            },
            None => return, // path was not provided by the user, we can just exit
        };

        let _ = load_data(&app_handle);
        window.set_focus().unwrap();
    });
}

pub fn save_character_sheet(app_state: State<JSONFile>) -> Result<(), String> {
    let data = serde_json::to_string(&app_state.get_data().as_value()).unwrap();
    let path = app_state.get_path();
    if path.to_str() == Some("") {return Ok(());}

    match std::fs::write(&path, &data) {
        Err(e) => return Err(e.to_string()),
        Ok(_) => {
            app_state.remove_not_saved_flag();
            return Ok(())
        },
    };
}

fn save_as_character_sheet(window: tauri::Window) {
    FileDialogBuilder::new().save_file(move |file_path| {
        let app = &window.app_handle();
        let data_json = app.state::<JSONFile>().get_data().as_value();
        let data = serde_json::to_string(&data_json).unwrap();
        match file_path {
            Some(p) => {
                match std::fs::write(&p, &data) {
                    Err(_e) => {},
                    Ok(_) => {
                        app.state::<JSONFile>().set_path(p);
                        app.state::<JSONFile>().remove_not_saved_flag();
                    },
                };
            },
            None => return, // path was not provided by the user, we can just exit
        };

        window.set_focus().unwrap();
    });
}