use serde_json::{Value, Map};
use tauri::Manager;
use crate::app_state::{JSONFile, GridGhost};

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
}

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