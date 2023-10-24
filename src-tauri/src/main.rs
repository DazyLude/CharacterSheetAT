// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::path::PathBuf;

use tauri::{ Manager, State, AppHandle, RunEvent };
use app::logger::log_tauri_error;
use app::menu::{ generate_app_menu, menu_handler };

use app::app_state::{JSONFile, app_state_to_recovery_string, load_app_state_from_recovery_string};
use app::disk_interactions::{load_startup_data, save_startup_data};

use app::ipc::{ChangeJSON, load_data, PayloadJSON};

fn main() {
    let run_handler = |app_handle: &AppHandle, event: RunEvent| {
        match event {
            tauri::RunEvent::ExitRequested { .. }  => {
                let r_s = app_state_to_recovery_string(&app_handle);
                let _ = save_startup_data(&app_handle, &r_s);
            }
            tauri::RunEvent::Ready => {
                let r_s = match load_startup_data(&app_handle) {
                    Ok(s) => s,
                    Err(_) => return,
                };
                load_app_state_from_recovery_string(app_handle, &r_s);
            }
            _ => {}
        }
    };

    tauri::Builder::default()
        .setup(|app| {
            app.listen_global("error", log_tauri_error);
            Ok(())
        })
        .menu(generate_app_menu())
        .on_menu_event(menu_handler)
        .manage(JSONFile::new())
        .invoke_handler(tauri::generate_handler![change_data, request_data, request_path, make_path_relative])
        .build(tauri::generate_context!())
        .expect("error when building tauri application")
        .run(run_handler);
}

#[tauri::command]
fn change_data(app_handle: AppHandle, app_state: State<JSONFile>, payload: ChangeJSON) -> Result<(), String> {
    let _ = app_state.change_character_data(payload);
    load_data(&app_handle)
}

#[tauri::command]
fn request_data(app_state: State<JSONFile>) -> Result<PayloadJSON, String> {
    Ok(PayloadJSON {
        data: app_state.get_data().as_value(),
    })
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