use serde_json::{json, Map};
use tauri::{ AppHandle, Manager, WindowEvent };

use crate::{ipc, app_state::GridGhost};

pub mod editor;
pub mod add_element;
pub mod remove_element;


pub fn after_events_cleared(app_handle: &AppHandle) {
    match app_handle.get_window("editor").as_ref() {
        Some(w) => editor::after_events_cleared(app_handle, w),
        None => {}
    }
}

pub fn run_event_handler(app_handle: &AppHandle, label: String, event: WindowEvent) {
    match label.as_str() {
        "editor" => {
            editor::run_event_handler(app_handle, event);
        }
        "add_element" => {
            match event {
                WindowEvent::Focused(true) => {
                    app_handle.state::<GridGhost>().set_window("adder".to_string());
                    ipc::add_ghost_request(app_handle);
                }
                WindowEvent::CloseRequested { .. } => {
                    app_handle.state::<GridGhost>().append_to_style(
                        Map::from(json!({"display": "none"}).as_object().unwrap().clone()),
                        "adder".to_string()
                    );
                    ipc::draw_ghost(app_handle)
                }
                _ => {}
            }
        }
        "remove_element" => {
            match event {
                WindowEvent::Focused(true) => {
                        app_handle.state::<GridGhost>().set_window("remover".to_string());
                        ipc::remove_ghost_request(app_handle);
                }
                WindowEvent::CloseRequested { .. } | WindowEvent::Focused(false) => {
                    app_handle.state::<GridGhost>().append_to_style(
                        Map::from(json!({"display": "none"}).as_object().unwrap().clone()),
                        "remover".to_string()
                    );
                    ipc::draw_ghost(app_handle)
                }
                _ => {}
            }
        }
        _ => {},
    }
}