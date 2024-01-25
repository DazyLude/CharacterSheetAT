//! The IPC module consists of structs used for IPC, global events and commands definition
use serde_json::Value;
use tauri::{App, AppHandle, Manager, RunEvent, WindowMenuEvent};

use crate::app_state::{load_app_state_from_recovery_string, LoadedShortcuts};
use crate::disk_interactions::{
    load_startup_data, open_character_sheet, save_as_character_sheet, save_character_sheet,
};
use crate::windows::{self, CSATWindow, EditorStateSync};

use super::PressedKey;

/// RunEvents not specific to a certain window should be handled from here
pub fn run_event_handler(app_handle: &AppHandle, event: RunEvent) {
    match event {
        tauri::RunEvent::Ready => {
            let r_s = match load_startup_data(&app_handle) {
                Ok(s) => s,
                Err(_) => return,
            };
            load_app_state_from_recovery_string(app_handle, &r_s);
        }
        tauri::RunEvent::WindowEvent { label, event, .. } => {
            windows::run_event_handler(app_handle, label, event)
        }
        tauri::RunEvent::MainEventsCleared => {
            windows::after_events_cleared(app_handle);
        }
        _ => {}
    }
}

/// Global, non-window specific events are setup here.
/// If an event is listened to globally, but it's functionality is tied to a certain window, it should be defined in that window's module.
pub fn setup_app_event_listeners(app: &mut App) -> Result<(), Box<dyn std::error::Error>> {
    app.listen_global("error", log_tauri_error);
    app.listen_global("log", log_tauri_log);

    let handle = app.handle();
    app.listen_global("keypress", move |e| {
        keypress_event_handler(&handle, e);
    });

    Ok(())
}

/// non window specific menu event handlers should be defined here.
/// Same idea as with app_event_listeners
pub fn menu_event_handler(event: WindowMenuEvent) {
    let app_handle = event.window().app_handle();
    match event.menu_item_id() {
        "new" => {
            event_handler(AppEvent::FileNew, &app_handle);
        }
        "open" => {
            event_handler(AppEvent::FileOpen, &app_handle);
        }
        "save" => {
            event_handler(AppEvent::FileSave, &app_handle);
        }
        "save as" => {
            event_handler(AppEvent::FileSaveAs, &app_handle);
        }
        "undo" => {
            event_handler(AppEvent::ActionUndo, &app_handle);
        }
        "redo" => {
            event_handler(AppEvent::ActionRedo, &app_handle);
        }
        "add_element" => {
            event_handler(AppEvent::WindowAddElement, &app_handle);
        }
        "readonly_switch" => {
            event_handler(AppEvent::ModReadOnly, &app_handle);
        }
        "layout_switch" => {
            event_handler(AppEvent::ModGridEdit, &app_handle);
        }
        "element_switch" => {
            event_handler(AppEvent::ModElementEdit, &app_handle);
        }
        e => {
            let app_handle = event.window().app_handle();
            emit_tauri_error(
                &app_handle,
                format!("Got an unimplemented menu event with id: {:?}", e),
            );
        }
    }
}

/// Global event emitters that are listened to at the frontend should be defined in this module.
pub fn change_editor_context(app_handle: &AppHandle, action: String) {
    app_handle
        .emit_all("change_context", action)
        .unwrap_or_else(|error| emit_tauri_error(app_handle, error.to_string()));
}

/// triggers backend event that runs logger method
pub fn emit_tauri_error(app_handle: &AppHandle, error_msg: String) {
    app_handle.trigger_global("error", Some(error_msg));
}

pub fn emit_tauri_log(app_handle: &AppHandle, log_msg: String) {
    app_handle.trigger_global("log", Some(log_msg));
}

fn log_tauri_error(event: tauri::Event) {
    match event.payload() {
        Some(payload) => println!("{}", payload),
        None => println!("error happened, somewhere, somehow"),
    }
}

fn log_tauri_log(event: tauri::Event) {
    match event.payload() {
        Some(payload) => println!("{}", payload),
        None => println!("logger called, somewhere, somehow"),
    }
}

/// helper function that unpacks an event and returns Some(Value) if possible, None otherwise
pub fn get_json_from_event(event: tauri::Event) -> Option<Value> {
    let payload_contents = match event.payload() {
        Some(s) => s,
        None => {
            return None;
        }
    };
    match serde_json::from_str(payload_contents) {
        Ok(p) => p,
        Err(_e) => {
            return None;
        }
    }
}

fn keypress_event_handler(handle: &AppHandle, event: tauri::Event) {
    let payload_as_json = match get_json_from_event(event) {
        Some(p) => p,
        None => {
            emit_tauri_error(handle, "empty payload on the keypress event".to_string());
            return;
        }
    };
    let pressed_key = PressedKey::from_json(&payload_as_json);
    shortcut_handler(&handle, &pressed_key);
}

fn shortcut_handler(app_handle: &AppHandle, key: &PressedKey) {
    let state = app_handle.state::<LoadedShortcuts>();
    println!("{}", key.get_accelerator());
    let action = match state.get_entry(key) {
        Some(a) => a,
        None => return,
    };
    event_handler(action, app_handle)
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, PartialOrd, Ord, strum_macros::EnumIter)]
pub enum AppEvent {
    FileNew,
    FileSave,
    FileSaveAs,
    FileOpen,
    ActionUndo,
    ActionRedo,
    WindowAddElement,
    WindowDebug,
    ModReadOnly,
    ModGridEdit,
    ModElementEdit,
    Unknown,
}

impl AppEvent {
    pub fn to_string(self) -> String {
        match self {
            AppEvent::FileNew => "new file",
            AppEvent::FileSave => "save file",
            AppEvent::FileSaveAs => "save file as",
            AppEvent::FileOpen => "open file",
            AppEvent::ActionUndo => "undo",
            AppEvent::ActionRedo => "redo",
            AppEvent::WindowAddElement => "focus add element window",
            AppEvent::WindowDebug => "focus debug window",
            AppEvent::ModReadOnly => "switch readonly mode",
            AppEvent::ModGridEdit => "switch grid editing",
            AppEvent::ModElementEdit => "switch element editing",
            AppEvent::Unknown => "unknown",
        }
        .to_string()
    }
}

impl From<&str> for AppEvent {
    fn from(value: &str) -> Self {
        match value {
            "new file" => AppEvent::FileNew,
            "save file" => AppEvent::FileSave,
            "save file as" => AppEvent::FileSaveAs,
            "open file" => AppEvent::FileOpen,
            "undo" => AppEvent::ActionUndo,
            "redo" => AppEvent::ActionRedo,
            "focus add element window" => AppEvent::WindowAddElement,
            "focus debug window" => AppEvent::WindowDebug,
            "switch readonly mode" => AppEvent::ModReadOnly,
            "switch grid editing" => AppEvent::ModGridEdit,
            "switch element editing" => AppEvent::ModElementEdit,
            _ => AppEvent::Unknown,
        }
    }
}

fn event_handler(action: AppEvent, app_handle: &AppHandle) {
    match action {
        AppEvent::FileNew => {
            let v = Value::Object(serde_json::Map::new());
            let p = "".into();
            app_handle
                .state::<EditorStateSync>()
                .change_associated_file(&app_handle, p, v);
        }
        AppEvent::FileOpen => {
            let window = match app_handle.get_focused_window() {
                Some(w) => w,
                None => match app_handle.get_window("editor") {
                    Some(w) => w,
                    None => {
                        emit_tauri_error(app_handle, "no editor window found".to_string());
                        return;
                    }
                },
            };
            open_character_sheet(window);
        }
        AppEvent::FileSave => {
            let _ = save_character_sheet(app_handle.state::<EditorStateSync>());
        }
        AppEvent::FileSaveAs => {
            let window = match app_handle.get_focused_window() {
                Some(w) => w,
                None => match app_handle.get_window("editor") {
                    Some(w) => w,
                    None => {
                        emit_tauri_error(app_handle, "no editor window found".to_string());
                        return;
                    }
                },
            };
            save_as_character_sheet(window);
        }
        AppEvent::ActionUndo => {
            app_handle.state::<EditorStateSync>().go_back(&app_handle);
        }
        AppEvent::ActionRedo => {
            app_handle
                .state::<EditorStateSync>()
                .go_forward(&app_handle);
        }
        AppEvent::WindowAddElement => {
            let h = app_handle.clone();
            let _ = match app_handle.get_window("add_element") {
                Some(w) => {
                    let _ = w.set_focus();
                    w.show()
                }
                None => {
                    windows::AddElementWindow::builder(&h);
                    Ok(())
                }
            };
        }
        AppEvent::ModReadOnly => {
            change_editor_context(app_handle, "readOnly-switch".to_string());
        }
        AppEvent::ModGridEdit => {
            change_editor_context(app_handle, "layoutEdit-switch".to_string());
        }
        AppEvent::ModElementEdit => {
            change_editor_context(app_handle, "elementEdit-switch".to_string());
        }
        AppEvent::WindowDebug => {
            let h = app_handle.clone();
            let _ = match app_handle.get_window("debug_window") {
                Some(w) => {
                    let _ = w.set_focus();
                    w.show()
                }
                None => {
                    windows::DebugWindow::builder(&h);
                    Ok(())
                }
            };
        }
        a => {
            emit_tauri_error(
                &app_handle,
                format!("action {} handling not implemented", a.to_string()),
            );
            return;
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use strum::IntoEnumIterator;

    #[test]
    fn shortcut_to_str_and_back() {
        for action in AppEvent::iter() {
            assert_eq!(action, action.to_string().as_str().into());
        }
    }
}
