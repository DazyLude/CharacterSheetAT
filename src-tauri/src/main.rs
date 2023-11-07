// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{ State, AppHandle };
use serde_json::{ Value, Map };

use app::windows;
use app::app_state::{ change_character_data, JSONFile, GridGhost };
use app::ipc::{ ChangeJSON, load_data, PayloadJSON, draw_ghost, handle_non_default_request };
use app::events::{ run_event_handler, setup_app_event_listeners, menu_event_handler };

fn main() {
    let app = tauri::Builder::default()
        .setup(setup_app_event_listeners)
        .manage(JSONFile::new())
        .manage(GridGhost::new())
        .on_menu_event(menu_event_handler)
        .invoke_handler(tauri::generate_handler![change_data, request_data, request_ghost_drawn])
        .build(tauri::generate_context!())
        .expect("error when building tauri application");

    let _ = windows::editor::builder(app.handle());

    app.run(run_event_handler);
}

#[tauri::command]
fn change_data(app_handle: AppHandle, file: State<JSONFile>, payload: ChangeJSON) -> Result<(), String> {
    let _ = change_character_data(&file, payload);
    load_data(&app_handle);
    Ok(())
}

#[tauri::command]
fn request_data(app_state: State<JSONFile>, requested_data: Option<String>, requested_data_argument: Option<Value>) -> Result<PayloadJSON, String> {
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

#[tauri::command]
fn request_ghost_drawn(app_handle: AppHandle, current_style: State<GridGhost>, ghost_style: Map<String, Value>, append: Option<Value>) {
    let current_window = current_style.get_window();
    match append {
        Some(_) => current_style.append_to_style(ghost_style, current_window),
        None => current_style.set_new_style(ghost_style, current_window),
    }
    draw_ghost(&app_handle)
}