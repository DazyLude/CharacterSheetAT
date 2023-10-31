// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::path::PathBuf;

use tauri::{ State, AppHandle };

use app::windows;
use app::app_state::{ change_character_data, JSONFile };
use app::ipc::{ ChangeJSON, load_data, PayloadJSON, PressedKey };
use app::events::{ run_event_handler, setup_app_event_listeners, menu_event_handler, shortcut_handler };

fn main() {
    let app = tauri::Builder::default()
        .setup(setup_app_event_listeners)
        .manage(JSONFile::new())
        .on_menu_event(menu_event_handler)
        .invoke_handler(tauri::generate_handler![change_data, request_data, request_path, make_path_relative, shortcut])
        .build(tauri::generate_context!())
        .expect("error when building tauri application");

    let _ = windows::editor::builder(app.handle());

    app.run(run_event_handler);
}

#[tauri::command]
fn change_data(app_handle: AppHandle, file: State<JSONFile>, payload: ChangeJSON) -> Result<(), String> {
    println!("{:?}", payload);
    let _ = change_character_data(&file, payload);
    load_data(&app_handle)
}

#[tauri::command]
fn request_data(app_state: State<JSONFile>, requested_data: Option<String>) -> Result<PayloadJSON, String> {
    match requested_data {
        Some(data) => {
            match data.as_str() {
                _e => return Err(format!("incorrect data type requested: {}", _e)),
            }
        }
        None => {
            return Ok(PayloadJSON {
                data: app_state.get_data().as_value(),
            })
        }
    }
}

#[tauri::command]
fn request_path(app_state: State<JSONFile>, path: String) -> Result<String, String> {
    let child_path : PathBuf = path.into();
    if child_path.is_absolute() {
        return Err(child_path.to_string_lossy().to_string());
    }
    let mut json_path : PathBuf = app_state.get_path();
    json_path.pop();
    Ok(json_path.join::<PathBuf>(child_path).to_string_lossy().to_string())
}

#[tauri::command]
fn make_path_relative(app_state: State<JSONFile>, path: String) -> Result<String, String> {
    let mut json_path : PathBuf = app_state.get_path();
    json_path.pop();
    let child_path : PathBuf = path.into();
    if !child_path.starts_with(&json_path) {
        return Err(child_path.to_string_lossy().to_string());
    }
    Ok(child_path.strip_prefix(&json_path).unwrap().to_string_lossy().to_string())
}

#[tauri::command]
fn shortcut(app_handle: AppHandle, payload: PressedKey) {
    shortcut_handler(&app_handle, &payload);
}