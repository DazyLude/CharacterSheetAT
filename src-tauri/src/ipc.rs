use serde_json::{Value, Map};
use tauri::Manager;
use crate::app_state::JSONFile;
use crate::character_data::CharacterData;

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

pub fn apply_change(change: ChangeJSON, data: &mut CharacterData) -> Result<(), String> {
    let err_change = change.clone();
    if let Some(merge) = change.merge_object {
        match change.value_type.as_str() {
            "global" => {
                if let Some(v_n) = change.value_name {
                    data.merge_global(v_n, merge);
                    return Ok(());
                }
            },
            "grid" => {
                if let Some(id) = change.id {
                    data.merge_grid(id, merge);
                    return Ok(());
                }
            },
            "element" => {
                if let Some(id) = change.id {
                    data.merge_element(id, merge);
                    return Ok(());
                }
            },
            "element-set" => {
                if let (Some(id), Some(item_name)) = (change.id, change.value_name) {
                    data.merge_with_set_item(id, item_name, merge);
                    return Ok(());
                }
            },
            _ => {}
        }
    }
    else {
        match change.value_type.as_str() {
            "global" => {
                if let (Some(v_n), Some(n_v)) = (change.value_name, change.new_value)  {
                    data.edit_global(v_n, n_v);
                    return Ok(());
                }
            },
            "grid" => {
                if let (Some(id), Some(v_n), Some(n_v)) = (change.id, change.value_name, change.new_value)  {
                    data.edit_grid(id, v_n, n_v);
                    return Ok(());
                }
            },
            "element" => {
                if let (Some(id), Some(v_n), Some(n_v)) = (change.id, change.value_name, change.new_value)  {
                    data.edit_element(id, v_n, n_v);
                    return Ok(());
                }
            },
            "remove" => {
                if let Some(id) = change.id {
                    data.remove_by_id(id);
                    return Ok(());
                }
            }
            "element-set" => {
                if let (Some(id), Some(v_n), Some(n_v)) = (change.id, change.value_name, change.new_value)  {
                    data.add_to_set(id, v_n, n_v);
                    return Ok(());
                }
            },
            "remove-set" => {
                if let (Some(id), Some(name)) = (change.id, change.value_name) {
                    data.remove_from_set(id, name);
                    return Ok(());
                }
            },
            _ => {},
        }
    }
    Err(format!("ill formed changeJSON: {:?}", err_change))
}

pub fn load_data(app_handle: &tauri::AppHandle) -> Result<(), String> {
    let data = app_handle.state::<JSONFile>().data.lock().unwrap().as_value();
    app_handle
        .emit_all("new_character_sheet", PayloadJSON { data } )
        .unwrap_or_else(|error|
            app_handle.trigger_global("error", Some(error.to_string()))
        );
    Ok(())
}