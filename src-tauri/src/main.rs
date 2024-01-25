// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::AppHandle;
use serde_json::Value;

use app::windows::{ EditorWindow, CSATWindow };
use app::app_state::manage_states;
use app::ipc::{ PayloadJSON, handle_data_request, handle_change_request, handle_call };
use app::ipc::{ run_event_handler, setup_app_event_listeners, menu_event_handler };

fn main() {
    let app = tauri::Builder::default()
        .setup(setup_app_event_listeners)
        .on_menu_event(menu_event_handler)
        .invoke_handler(tauri::generate_handler![change_data, request_data, call])
        .build(tauri::generate_context!())
        .expect("error when building tauri application");
    manage_states(&app.handle());
    let _ = EditorWindow::builder(&app.handle());

    app.run(run_event_handler);
}

#[tauri::command]
fn change_data(app_handle: AppHandle, target: String, data: Value) -> Result<(), String> {
    handle_change_request(app_handle, target, data)
}

#[tauri::command]
fn request_data(app_handle: AppHandle, requested_data: String, requested_data_argument: Option<Value>) -> Result<PayloadJSON, String> {
    handle_data_request(app_handle, &requested_data, requested_data_argument)
}

#[tauri::command]
fn call(app_handle: AppHandle, code: String, args: Option<Value>) {
    handle_call(app_handle, code, args);
}