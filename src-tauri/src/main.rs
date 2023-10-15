// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::api::dialog::FileDialogBuilder;
use tauri::{Manager, CustomMenuItem, Menu};

use serde_json::Value;

use std::fs::File;
use std::io::BufReader;
use std::path::PathBuf;


fn main() {
    let menu = Menu::new()
        .add_item(CustomMenuItem::new("log", "Log"));
    tauri::Builder::default()
        .menu(menu)
        .setup(|app| {
            app.listen_global("error", log_error);
            Ok(())
        })
        .on_menu_event(|event| {
            match event.menu_item_id() {
                "log" => {
                    println!("Got an event from {:?}", event.menu_item_id())
                }
                _ => {}
            }
        })
        .invoke_handler(tauri::generate_handler![get_character_sheet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}


fn log_error(event: tauri::Event) {
    match event.payload() {
        Some(payload) => println!("{}", payload),
        None => println!("error happened, somewhere, somehow"),
    }
}

#[derive(Clone, serde::Serialize)]
struct PayloadJSON {
    data: Value,
}

#[tauri::command]
fn get_character_sheet(app_handle: tauri::AppHandle, window: tauri::Window) {
    FileDialogBuilder::new().pick_file(move |file_path| {
        let path: PathBuf = match file_path {
            Some(p) => p,
            None => return, // path was not provided by the user, we can just exit
        };
        let open_file = |path| -> Result<File, String> {
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

        match open_file(path).and_then(parse_from_reader) {
            Ok(v) => app_handle
                .emit_all("new_character_sheet", PayloadJSON { data : v } )
                .unwrap_or_else(report_tauri_error),
            Err(err) => report_error(err),
        };

        window.set_focus().unwrap();
    });
}