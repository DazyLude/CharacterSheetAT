use tauri::{ AppHandle, Manager, WindowEvent };

pub mod editor;


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
        _ => {},
    }
}