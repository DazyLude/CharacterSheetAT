//! The IPC module consists of structs used for IPC, global events and commands definition
use serde_json::Value;
use tauri::{ Manager, AppHandle, RunEvent, App, WindowMenuEvent };

use crate::app_state::{
    loaded_shortcuts::LoadedShortcuts,
    load_app_state_from_recovery_string,
};
use crate::character_data::CharacterData;
use crate::disk_interactions::{load_startup_data, open_character_sheet, save_character_sheet, save_as_character_sheet};
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
        tauri::RunEvent::WindowEvent { label, event, .. } => windows::run_event_handler(app_handle, label, event),
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

    let handle = app.handle();
    app.listen_global("keypress", move |e| {
        keypress_event_handler(&handle, e);
    });

    Ok(())
}

/// non window specific menu event handlers should be defined here.
/// Same idea as with app_event_listeners
pub fn menu_event_handler(event: WindowMenuEvent) {
    match event.menu_item_id() {
        "open" => {
            open_character_sheet(event.window().clone());
        }
        "save" => {
            let _ = save_character_sheet(event.window().app_handle().state::<EditorStateSync>());
        }
        "save as" => {
            save_as_character_sheet(event.window().clone());
        }
        "new" => {
            let app_handle = event.window().app_handle();
            let v = CharacterData::generate_empty();
            let p = "".into();
            app_handle.state::<EditorStateSync>().change_associated_file(&app_handle, p, v);
        }
        "undo" => {
            let app_handle = event.window().app_handle();
            app_handle.state::<EditorStateSync>().go_back(&app_handle);
        }
        "redo" => {
            let app_handle = event.window().app_handle();
            app_handle.state::<EditorStateSync>().go_forward(&app_handle);
        },
        "add_element" => {
            let app_handle = event.window().app_handle();
            let _ = match app_handle.get_window("add_element") {
                Some(w) => w.set_focus(),
                None => {
                    windows::AddElementWindow::builder(&app_handle);
                    Ok(())
                },
            };
        },
        "remove_element" => {
            let app_handle = event.window().app_handle();
            let _ = match app_handle.get_window("remove_element") {
                Some(w) => w.set_focus(),
                None => windows::remove_element::builder(app_handle),
            };
        },
        "readonly_switch" => {
            let app_handle = event.window().app_handle();
            change_editor_context(&app_handle, "readOnly-switch".to_string());
        }
        "layout_switch" => {
            let app_handle = event.window().app_handle();
            change_editor_context(&app_handle, "layoutEdit-switch".to_string());
        }
        "element_switch" => {
            let app_handle = event.window().app_handle();
            change_editor_context(&app_handle, "elementEdit-switch".to_string());
        }
        e => println!("Got an unimplemented menu event with id: {:?}", e),
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

fn log_tauri_error(event: tauri::Event) {
    match event.payload() {
        Some(payload) => println!("{}", payload),
        None => println!("error happened, somewhere, somehow"),
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
        },
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
    let pressed_key = PressedKey::from_json(payload_as_json);
    shortcut_handler(&handle, &pressed_key);
}

fn shortcut_handler(app_handle: &AppHandle, key: &PressedKey) {
    let state = app_handle.state::<LoadedShortcuts>();
    let action = match state.get_entry(key) {
        Some(a) => a,
        None => return,
    };

    match action.as_str() {
        "save" => {
            let _ = save_character_sheet(app_handle.state::<EditorStateSync>());
        },
        "undo" => {
            app_handle.state::<EditorStateSync>().go_back(&app_handle);
        },
        "redo" => {
            app_handle.state::<EditorStateSync>().go_forward(&app_handle);
        },
        "open-add" => {
            let h = app_handle.clone();
            let _ = match app_handle.get_window("add_element") {
                Some(w) => {
                    let _ = w.set_focus();
                    w.show()
                }
                None => {
                    windows::AddElementWindow::builder(&h);
                    Ok(())
                },
            };
        }
        "open-rem" => {
            let h = app_handle.clone();
            let _ = match app_handle.get_window("remove_element") {
                Some(w) => {
                    let _ = w.set_focus();
                    w.show()
                }
                None => windows::remove_element::builder(h),
            };
        }
        "mod1" => {
            change_editor_context(app_handle, "readOnly-switch".to_string());
        }
        "mod2" => {
            change_editor_context(app_handle, "layoutEdit-switch".to_string());
        }
        "mod3" => {
            change_editor_context(app_handle, "elementEdit-switch".to_string());
        }
        _ => return,
    }
}