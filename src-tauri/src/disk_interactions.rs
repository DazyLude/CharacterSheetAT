use tauri::{ Manager, State };
use tauri::api::dialog::FileDialogBuilder;
use crate::app_state::{JSONFile, load_json_file};
use crate::ipc::load_data;

use tauri::AppHandle;
use serde_json::Value;
use std::fs::File;
use std::io::{ BufReader, Read, Error, ErrorKind };
use std::path::PathBuf;

pub fn save_startup_data(app_handle: &AppHandle, data: &String) -> Result<(), Error> {
    let data_dir_path = match app_handle.path_resolver().app_data_dir() {
        Some(p) => p,
        None => return Err(Error::new(ErrorKind::Other, "app data directory not provided")),
    };
    let appdata_file_path = data_dir_path.join::<PathBuf>("startup.cfg".into());
    match std::fs::write(&appdata_file_path, &data.as_bytes()) {
        Err(e) => {
            match e.kind() {
                ErrorKind::NotFound => {
                    std::fs::create_dir(data_dir_path)?;
                    std::fs::write(&appdata_file_path, &data.as_bytes())?;
                    return Ok(());
                }
                _ => {},
            }
            Err(e)
        }
        a => a,
    }
}

pub fn load_startup_data(app_handle: &AppHandle) -> Result<String, Error> {
    let data_dir_path = match app_handle.path_resolver().app_data_dir() {
        Some(p) => p,
        None => return Err(Error::new(ErrorKind::Other, "app data directory not provided")),
    };
    let appdata_file_path = data_dir_path.join::<PathBuf>("startup.cfg".into());
    let file = File::open(appdata_file_path)?;
    let mut startup_data = String::new();
    BufReader::new(file).read_to_string(&mut startup_data)?;
    Ok(startup_data)
}

pub fn load_json_from_disk(path: &PathBuf) -> Result<Value, String> {
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
    open_file(&path).and_then(parse_from_reader)
}

pub fn open_character_sheet(window: tauri::Window) {
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

pub fn save_as_character_sheet(window: tauri::Window) {
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