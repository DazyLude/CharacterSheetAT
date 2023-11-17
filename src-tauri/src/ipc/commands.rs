use std::path::PathBuf;

use tauri::{ Manager, AppHandle, State };
use serde_json::Value;
use crate::character_data::CharacterDataCommand;
use crate::windows::{ AddElementStateSync, EditorStateSync };
use super::{ChangeJSON, PayloadJSON};

pub fn handle_change_request(handle: AppHandle, target: String, data: Value) -> Result<(), String> {
    match target.as_str() {
        "character_data" => return change_character_data(&handle, data.into()),
        "element_ghost" => Ok(()),
        e => return Err(format!("unknown change request target: {e}")),
    }
}

fn change_character_data(handle: &AppHandle, change: ChangeJSON) -> Result<(), String> {
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
                Some(state) => return Ok(PayloadJSON { data: state.as_value(&app_handle) }),
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