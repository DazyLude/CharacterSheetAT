use serde_json::{Value, Map, json};
use tauri::{ Manager, State };
use crate::app_state::{JSONFile, GridGhost};
use std::path::PathBuf;

#[derive(Clone, serde::Serialize, serde::Deserialize)]
pub struct PayloadJSON {
    pub data: Value,
}

#[derive(Clone, Debug, serde::Serialize, serde::Deserialize)]
pub struct ChangeJSON {
    pub value_type: String,
    pub id: Option<String>,
    pub value_name: Option<String>,
    pub new_value: Option<Value>,
    pub merge_object: Option<Map<String, Value>>,
}

#[derive(serde::Deserialize, Debug)]
pub struct PressedKey {
    ctrl_key: bool,
    alt_key: bool,
    key_code: String,
}

impl<'a> PressedKey {
    pub fn decompose(&'a self) -> (bool, bool, &'a str) {
        (self.ctrl_key, self.alt_key, self.key_code.as_str())
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


// event based IPC methods
pub fn load_data(app_handle: &tauri::AppHandle) {
    let data = app_handle.state::<JSONFile>().get_data().as_value();
    app_handle
        .emit_all("new_character_sheet", PayloadJSON { data } )
        .unwrap_or_else(|error|
            app_handle.trigger_global("error", Some(error.to_string()))
        );
}

pub fn draw_ghost(app_handle: &tauri::AppHandle) {
    let style = app_handle.state::<GridGhost>().get_style();
    app_handle
        .emit_all("draw_ghost", style)
        .unwrap_or_else(|error|
            app_handle.trigger_global("error", Some(error.to_string()))
        );
}

pub fn remove_ghost_request(app_handle: &tauri::AppHandle) {
    app_handle
        .emit_all("remove_ghost_request", Option::<()>::None)
        .unwrap_or_else(|error|
            app_handle.trigger_global("error", Some(error.to_string()))
        );
}

pub fn add_ghost_request(app_handle: &tauri::AppHandle) {
    app_handle
        .emit_all("add_ghost_request", Option::<()>::None)
        .unwrap_or_else(|error|
            app_handle.trigger_global("error", Some(error.to_string()))
        );
}

pub fn change_editor_context(app_handle: &tauri::AppHandle, action: String) {
    app_handle
        .emit_all("change_context", action)
        .unwrap_or_else(|error|
            app_handle.trigger_global("error", Some(error.to_string()))
        );
}

// command based IPC methods
pub fn handle_non_default_request(
    app_state: tauri::State<JSONFile>,
    requested_data: &str,
    requested_data_argument: Option<Value>
) -> Result<PayloadJSON, String> {
    match requested_data {
        "all" => {
            return Ok(PayloadJSON {
                data: app_state.get_data().as_value(),
            });
        }
        "abs_path" => {
            let path = match requested_data_argument.as_ref().and_then(Value::as_str) {
                Some(p) => p.to_string(),
                None => return Err(format!("incorrect data argument when requesting absolute path")),
            };
            return Ok(PayloadJSON{
                data: Value::String(request_path(app_state, path)?)
            });
        }
        "rel_path" => {
            let path = match requested_data_argument.as_ref().and_then(Value::as_str) {
                Some(p) => p.to_string(),
                None => return Err(format!("incorrect data argument when requesting relative path")),
            };
            return Ok(PayloadJSON{
                data: Value::String(make_path_relative(app_state, path)?)
            });
        }
        _e => return Err(format!("incorrect data type requested: {}", _e)),
    }
}

fn request_path(app_state: State<JSONFile>, path: String) -> Result<String, String> {
    let child_path : PathBuf = path.into();
    if child_path.is_absolute() {
        return Err(child_path.to_string_lossy().to_string());
    }
    let mut json_path : PathBuf = app_state.get_path();
    json_path.pop();
    Ok(json_path.join::<PathBuf>(child_path).to_string_lossy().to_string())
}

fn make_path_relative(app_state: State<JSONFile>, path: String) -> Result<String, String> {
    let mut json_path : PathBuf = app_state.get_path();
    json_path.pop();
    let child_path : PathBuf = path.into();
    if !child_path.starts_with(&json_path) {
        return Err(child_path.to_string_lossy().to_string());
    }
    Ok(child_path.strip_prefix(&json_path).unwrap().to_string_lossy().to_string())
}