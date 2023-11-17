//! The IPC module consists of structs used for IPC, global events and commands definition
use serde_json::{Value, Map, json};
use tauri::{ Manager, State, AppHandle, RunEvent, App, WindowMenuEvent };
use std::path::PathBuf;

use crate::app_state::{
    loaded_shortcuts::LoadedShortcuts,
    load_app_state_from_recovery_string,
};
use crate::character_data::{ CharacterData, CharacterDataCommand };
use crate::disk_interactions::{load_startup_data, open_character_sheet, save_character_sheet, save_as_character_sheet};
use crate::windows::{self, CSATWindow, AddElementStateSync, EditorStateSync};


/// Just a JSON value
#[derive(Clone, serde::Serialize, serde::Deserialize)]
pub struct PayloadJSON {
    pub data: Value,
}

/// struct used to issue changes to EditorState
#[derive(Clone, Debug, serde::Serialize, serde::Deserialize)]
pub struct ChangeJSON {
    pub value_type: String,
    pub id: Option<String>,
    pub value_name: Option<String>,
    pub new_value: Option<Value>,
    pub merge_object: Option<Map<String, Value>>,
}

/// Struct used to communicate pressed keys from frontend.
#[derive(serde::Deserialize, Debug, Eq, PartialEq, Hash)]
pub struct PressedKey {
    ctrl_key: bool,
    alt_key: bool,
    key_code: String,
}

impl<'a> PressedKey {
    pub fn decompose(&'a self) -> (bool, bool, &'a str) {
        (self.ctrl_key, self.alt_key, self.key_code.as_str())
    }
    pub fn compose(ctrl_key: bool, alt_key: bool, key_code: String) -> PressedKey {
        PressedKey { ctrl_key, alt_key, key_code }
    }

    pub fn from_json(v: Value) -> PressedKey {
        let empty = json!({}).as_object().unwrap().clone();
        let v_o = v.as_object().unwrap_or(&empty);
        PressedKey {
            ctrl_key: v_o.get("ctrl_key").and_then(Value::as_bool).unwrap_or(false),
            alt_key: v_o.get("alt_key").and_then(Value::as_bool).unwrap_or(false),
            key_code: v_o.get("key_code").and_then(Value::as_str).unwrap_or("KeyH").to_string(),
        }
    }
}

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
            event_emitters::change_editor_context(&app_handle, "readOnly-switch".to_string());
        }
        "layout_switch" => {
            let app_handle = event.window().app_handle();
            event_emitters::change_editor_context(&app_handle, "layoutEdit-switch".to_string());
        }
        "element_switch" => {
            let app_handle = event.window().app_handle();
            event_emitters::change_editor_context(&app_handle, "elementEdit-switch".to_string());
        }
        e => println!("Got an unimplemented menu event with id: {:?}", e),
    }
}

pub mod event_emitters {
    //! Global event emitters that are listened to at the frontend should be defined in this module.
    use super::emit_tauri_error;
    use tauri::{ Manager, AppHandle };

    pub fn change_editor_context(app_handle: &AppHandle, action: String) {
        app_handle
            .emit_all("change_context", action)
            .unwrap_or_else(|error| emit_tauri_error(app_handle, error.to_string()));
    }
}

pub fn emit_tauri_error(app_handle: &AppHandle, error_msg: String) {
    app_handle.trigger_global("error", Some(error_msg));
}


fn log_tauri_error(event: tauri::Event) {
    match event.payload() {
        Some(payload) => println!("{}", payload),
        None => println!("error happened, somewhere, somehow"),
    }
}


// event based comms
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
            event_emitters::change_editor_context(app_handle, "readOnly-switch".to_string());
        }
        "mod2" => {
            event_emitters::change_editor_context(app_handle, "layoutEdit-switch".to_string());
        }
        "mod3" => {
            event_emitters::change_editor_context(app_handle, "elementEdit-switch".to_string());
        }
        _ => return,
    }
}

// command based IPC methods
pub fn change_character_data(handle: &AppHandle, change: ChangeJSON) -> Result<(), String> {
    let data = match handle.try_state::<EditorStateSync>() {
        Some(d) => d,
        None => return Err("editor state not managed yet".to_string()),
    };
    let command = CharacterDataCommand::from_change_json(data.get_data(), change);
    data.change_data(command, handle)
}

pub fn handle_data_request(
    app_handle: AppHandle,
    requested_data: &str,
    requested_data_argument: Option<Value>
) -> Result<PayloadJSON, String> {
    match requested_data {
        "abs_path" => {
            let editor_state = app_handle.state::<EditorStateSync>();
            let path = match requested_data_argument.as_ref().and_then(Value::as_str) {
                Some(p) => p.to_string(),
                None => return Err(format!("incorrect data argument when requesting absolute path")),
            };
            return Ok(PayloadJSON{
                data: Value::String(request_path(editor_state, path)?)
            });
        }
        "rel_path" => {
            let editor_state = app_handle.state::<EditorStateSync>();
            let path = match requested_data_argument.as_ref().and_then(Value::as_str) {
                Some(p) => p.to_string(),
                None => return Err(format!("incorrect data argument when requesting relative path")),
            };
            return Ok(PayloadJSON{
                data: Value::String(make_path_relative(editor_state, path)?)
            });
        }
        "editor" => {
            match app_handle.try_state::<EditorStateSync>() {
                Some(state) => return Ok(PayloadJSON { data: state.as_value() }),
                None => return Err("editor window state not managed".to_string()),
            }
        }
        "add-element" => {
            match app_handle.try_state::<AddElementStateSync>() {
                Some(state) => return Ok(PayloadJSON { data: state.as_value() }),
                None => return Err("add element window state not managed".to_string()),
            }
        }
        _e => return Err(format!("incorrect data type requested: {}", _e)),
    }
}

fn request_path(app_state: State<EditorStateSync>, path: String) -> Result<String, String> {
    let child_path : PathBuf = path.into();
    if child_path.is_absolute() {
        return Err(child_path.to_string_lossy().to_string());
    }
    let mut json_path : PathBuf = app_state.get_path();
    json_path.pop();
    Ok(json_path.join::<PathBuf>(child_path).to_string_lossy().to_string())
}

fn make_path_relative(app_state: State<EditorStateSync>, path: String) -> Result<String, String> {
    let mut json_path : PathBuf = app_state.get_path();
    json_path.pop();
    let child_path : PathBuf = path.into();
    if !child_path.starts_with(&json_path) {
        return Err(child_path.to_string_lossy().to_string());
    }
    Ok(child_path.strip_prefix(&json_path).unwrap().to_string_lossy().to_string())
}