// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde_json::Value;
use tauri::{Error, Manager};

use std::fs::File;
use std::io::BufReader;
use tauri::api::dialog::FileDialogBuilder;
use std::path::PathBuf;

#[derive(Clone, serde::Serialize)]
struct PayloadJSON {
    message: Value,
}


fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![get_character_sheet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}


#[tauri::command]
fn get_character_sheet(app_handle: tauri::AppHandle, window: tauri::Window) -> Result<Value, Error> {
    FileDialogBuilder::new().pick_file(move |file_path| {
        let path: PathBuf = match file_path {
            Some(p) => p,
            None => return,
        };
        let file = match File::open(path) {
            Ok(f) => f,
            Err(_) => return,
        };
        let reader = BufReader::new(file);
        let m = match serde_json::from_reader(reader) {
            Ok(v) => v,
            Err(_) => return,
        };
        match app_handle.emit_all("new_character_sheet", PayloadJSON { message : m } ) {
            Ok(_) => {},
            Err(_) => {},
        };
        window.set_focus().unwrap();
    });
    Ok(Value::Null)
}