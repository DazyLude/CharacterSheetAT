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