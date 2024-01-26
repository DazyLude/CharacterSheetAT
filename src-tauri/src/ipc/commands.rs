use std::path::PathBuf;

use super::{emit_tauri_error, ChangeJSON, PayloadJSON};
use crate::app_state::{CatalogueItemType, CatalogueState, ConfigState, ElementGhost};
use crate::character_data::CharacterDataCommand;
use crate::disk_interactions::save_json_to_disk;
use crate::windows::{AddElementStateSync, EditorStateSync};
use serde_json::{Map, Value};
use tauri::api::dialog::FileDialogBuilder;
use tauri::{AppHandle, Manager, State};

pub fn handle_change_request(
    app_handle: AppHandle,
    target: String,
    data: Value,
) -> Result<(), String> {
    match target.as_str() {
        "character_data" => return change_character_data(&app_handle, data.into()),
        "element_ghost" => {
            let new_placement = match data.as_object() {
                Some(o) => o.clone(),
                None => {
                    return Err(format!(
                        "invalid data in element ghost change request: {data}"
                    ))
                }
            };
            app_handle
                .state::<ElementGhost>()
                .update_placement(new_placement, &app_handle);
            Ok(())
        }
        "config" => {
            let data = match data.as_object() {
                Some(d) => d.clone(),
                None => return Err(format!("invalid data in config change request: {data}")),
            };
            app_handle.state::<ConfigState>().apply_changes(data)
        }
        "catalogue_add" => {
            let (item_type, item) = match data.as_object() {
                Some(d) => {
                    let item = d.get("item");
                    let item_type = d.get("type").and_then(Value::as_str);
                    match (item_type, item) {
                        (Some(t), Some(i)) => (CatalogueItemType::from(t), i),
                        (_, _) => return Err(format!("incorrect add to catalogue data format: got {:?}, {{item: {{...}}, type: \"...\"}} required", data)),
                    }
                }
                None => {
                    return Err(format!(
                        "invalid data in add item to catalogue request: {data}"
                    ))
                }
            };
            match app_handle.try_state::<CatalogueState>() {
                Some(state) => {
                    state.add_item(item_type, item);
                }
                None => return Err(format!("catalogue state not managed")),
            }
            Ok(())
        }
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
    requested_data_argument: Option<Value>,
) -> Result<PayloadJSON, String> {
    match requested_data {
        "abs_path" => {
            let editor_state = app_handle.state::<EditorStateSync>();
            let path = match requested_data_argument.as_ref().and_then(Value::as_str) {
                Some(p) => p.to_string(),
                None => {
                    return Err(format!(
                        "incorrect data argument when requesting absolute path"
                    ))
                }
            };
            return Ok(PayloadJSON {
                data: Value::String(request_path(editor_state, path)?),
            });
        }
        "rel_path" => {
            let editor_state = app_handle.state::<EditorStateSync>();
            let path = match requested_data_argument.as_ref().and_then(Value::as_str) {
                Some(p) => p.to_string(),
                None => {
                    return Err(format!(
                        "incorrect data argument when requesting relative path"
                    ))
                }
            };
            return Ok(PayloadJSON {
                data: Value::String(make_path_relative(editor_state, path)?),
            });
        }
        "editor" => match app_handle.try_state::<EditorStateSync>() {
            Some(state) => {
                return Ok(PayloadJSON {
                    data: state.as_value(),
                })
            }
            None => return Err("editor window state not managed".to_string()),
        },
        "add-element" => match app_handle.try_state::<AddElementStateSync>() {
            Some(state) => {
                return Ok(PayloadJSON {
                    data: state.as_value(),
                })
            }
            None => return Err("add element window state not managed".to_string()),
        },
        "ghost" => match app_handle.try_state::<ElementGhost>() {
            Some(state) => {
                return Ok(PayloadJSON {
                    data: state.as_value(),
                })
            }
            None => return Err("ghost element state not managed".to_string()),
        },
        "variable" => {
            let variable_name = match requested_data_argument.as_ref().and_then(Value::as_str) {
                Some(s) => s.to_string(),
                None => {
                    return Err(format!(
                        "incorrect variable name: {requested_data_argument:?}"
                    ))
                }
            };
            let data = match app_handle.try_state::<EditorStateSync>() {
                Some(state) => state.get_data(),
                None => return Err("editor window state not managed".to_string()),
            };
            match data.get_variable(&variable_name, None) {
                Ok(o) => Ok(PayloadJSON { data: o }),
                Err(e) => return Err(e),
            }
        }
        "variables" => {
            let data = match app_handle.try_state::<EditorStateSync>() {
                Some(state) => state.get_data(),
                None => return Err("editor window state not managed".to_string()),
            };
            Ok(PayloadJSON {
                data: Value::Object(data.get_variables()),
            })
        }
        "config" => {
            let data = match app_handle.try_state::<ConfigState>() {
                Some(state) => state.get_raw(),
                None => return Err("configuration not managed".to_string()),
            };
            Ok(PayloadJSON { data })
        }
        "catalogue_query" => {
            let (item_type, query) = match requested_data_argument {
                Some(ref v) => {
                    let query = v
                        .get("query")
                        .and_then(Value::as_str)
                        .and_then(|s| Some(s.to_string()));
                    let item_type = v.get("type").and_then(Value::as_str);
                    match (item_type, query) {
                        (Some(t), Some(q)) => (CatalogueItemType::from(t), q),
                        (_, _) => return Err(format!("incorrect catalogue query format: got {:?}, {{query: \"...\", type: \"...\"}} required", v)),
                    }
                }
                None => return Err("missing catalogue query arguments".to_string()),
            };
            match app_handle.try_state::<CatalogueState>() {
                Some(state) => {
                    let search_result = state.query_item(item_type, query);
                    return Ok(PayloadJSON {
                        data: search_result,
                    });
                }
                None => return Err("catalogue not managed".to_string()),
            }
        }
        "catalogue_get" => {
            todo!()
        }
        _e => return Err(format!("incorrect data type requested: {}", _e)),
    }
}

fn request_path(app_state: State<EditorStateSync>, path: String) -> Result<String, String> {
    let child_path: PathBuf = path.into();
    if child_path.is_absolute() {
        return Err(child_path.to_string_lossy().to_string());
    }
    let mut json_path: PathBuf = app_state.get_path();
    json_path.pop();
    Ok(json_path
        .join::<PathBuf>(child_path)
        .to_string_lossy()
        .to_string())
}

fn make_path_relative(app_state: State<EditorStateSync>, path: String) -> Result<String, String> {
    let mut json_path: PathBuf = app_state.get_path();
    json_path.pop();
    let child_path: PathBuf = path.into();
    if !child_path.starts_with(&json_path) {
        return Err(child_path.to_string_lossy().to_string());
    }
    Ok(child_path
        .strip_prefix(&json_path)
        .unwrap()
        .to_string_lossy()
        .to_string())
}

pub fn handle_call(app_handle: AppHandle, code: String, args: Option<Value>) {
    match code.as_str() {
        "save_config" => {
            let config_state = app_handle.state::<ConfigState>();
            config_state.save_to_disk(&app_handle);
        }
        "export_catalogues" => {
            let catalogues_state = app_handle.state::<CatalogueState>();
            let catalogues_to_save : Vec<_> = catalogues_state
                .export_current_catalogues()
                .into_iter()
                .map(|(cat_t, cat_v)| {
                    let mut temp_map = Map::new();
                    let cat_t = Value::String(cat_t.to_string());
                    temp_map.insert("type".to_string(), cat_t);
                    temp_map.insert("data".to_string(), cat_v);
                    Value::Object(temp_map)
                })
                .collect();
            for cat in catalogues_to_save {
                let app_handle_clone = app_handle.clone();
                FileDialogBuilder::new().save_file(move |file_path| {
                    let path = match file_path {
                        Some(p) => p,
                        None => return, // path was not provided by the user, we can just exit
                    };
                    save_json_to_disk(&app_handle_clone, &path, cat)
                });
            }
        }
        _ => emit_tauri_error(
            &app_handle,
            format!("unimplemented call code: {}, with args: {:?}", code, args),
        ),
    }
}
