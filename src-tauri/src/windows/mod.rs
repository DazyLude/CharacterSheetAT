use tauri::{ AppHandle, Manager, WindowEvent };

mod editor;
mod add_element;

pub use self::add_element::{ AddElementWindow, AddElementStateSync };
pub use self::editor::{ EditorWindow, EditorStateSync };

pub trait CSATWindow {
    const LABEL: &'static str;
    fn builder(app_handle: &AppHandle);
    fn run_event_handler(_app_handle: &AppHandle, _event: WindowEvent) {}
    fn after_events_cleared(_app_handle: &AppHandle, _window_handle: &tauri::Window) {}
}

pub fn after_events_cleared(app_handle: &AppHandle) {
    match app_handle.get_window("editor").as_ref() {
        Some(w) => EditorWindow::after_events_cleared(app_handle, w),
        None => {}
    }
}

pub fn run_event_handler(app_handle: &AppHandle, label: String, event: WindowEvent) {
    match label.as_str() {
        "editor" => {
            EditorWindow::run_event_handler(app_handle, event);
        }
        "add_element" => {
            AddElementWindow::run_event_handler(app_handle, event);
        }
        _ => {},
    }
}