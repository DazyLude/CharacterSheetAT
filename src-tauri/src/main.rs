// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{ State, AppHandle };
use serde_json::Value;

use app::windows;
use app::app_state::{ with_managed_states, change_character_data, editor_state::EditorState };
use app::ipc::{ event_emitters::load_data, ChangeJSON, PayloadJSON, handle_non_default_request };
use app::ipc::{ run_event_handler, setup_app_event_listeners, menu_event_handler };

fn main() {
    let app = with_managed_states()
        .setup(setup_app_event_listeners)
        .on_menu_event(menu_event_handler)
        .invoke_handler(tauri::generate_handler![change_data, request_data])
        .build(tauri::generate_context!())
        .expect("error when building tauri application");

    let _ = windows::editor::builder(app.handle());

    app.run(run_event_handler);
}

#[tauri::command]
fn change_data(app_handle: AppHandle, file: State<EditorState>, payload: ChangeJSON) -> Result<(), String> {
    let _ = change_character_data(&file, payload);
    load_data(&app_handle);
    Ok(())
}

#[tauri::command]
fn request_data(app_state: State<EditorState>, requested_data: Option<String>, requested_data_argument: Option<Value>) -> Result<PayloadJSON, String> {
    match requested_data {
        Some(data) => {
            handle_non_default_request(app_state, data.as_str(), requested_data_argument)
        }
        None => {
            return Ok(PayloadJSON {
                data: app_state.get_data().as_value(),
            })
        }
    }
}