use tauri::{ AppHandle, Manager, WindowEvent };

use crate::ipc;

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
                WindowEvent::Focused(b) => {
                    if b {
                        ipc::add_ghost_request(app_handle);
                    }
                }
                _ => {}
            }
        }
        "remove_element" => {
            match event {
                WindowEvent::Focused(b) => {
                    if b {
                        ipc::remove_ghost_request(app_handle);
                    }
                }
                _ => {}
            }
        }
        _ => {},
    }
}