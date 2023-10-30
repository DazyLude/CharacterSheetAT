use serde_json::{Value, Map};
use tauri::Manager;
use crate::app_state::JSONFile;

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

pub fn load_data(app_handle: &tauri::AppHandle) -> Result<(), String> {
    let data = app_handle.state::<JSONFile>().get_data().as_value();
    app_handle
        .emit_all("new_character_sheet", PayloadJSON { data } )
        .unwrap_or_else(|error|
            app_handle.trigger_global("error", Some(error.to_string()))
        );
    Ok(())
}