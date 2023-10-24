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
    id: Option<String>,
    value_name: Option<String>,
    new_value: Option<Value>,
    merge_object: Option<Map<String, Value>>,
}

impl ChangeJSON {
    pub fn to_data_tuple(self) -> (Option<String>, Option<String>, Option<Value>, Option<Map<String, Value>>) {
        (self.id, self.value_name, self.new_value, self.merge_object)
    }
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