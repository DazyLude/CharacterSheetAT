use tauri::{AppHandle, Manager};
use serde_json::{Value, Map, json};

use crate::{app_state::editor_state::EditorState, character_data::CharacterDataCommand};

pub fn builder(app_handle: AppHandle) -> Result<(), tauri::Error> {
    std::thread::spawn(
        move || {
            let _editor_window = tauri::WindowBuilder::new(
                    &app_handle,
                    "add_element",
                    tauri::WindowUrl::App("add_element".into())
                )
                .title("add element")
                .fullscreen(false)
                .resizable(false)
                .minimizable(false)
                .inner_size(522., 253.)
                .build()?;
            Ok(())
        }
    ).join().expect("panic in the AddElement thread")
}

pub struct AddElementState {
    pub new_placement: Map<String, Value>,
    pub new_id: String,
    pub is_active: bool,
}

impl AddElementState {
    pub fn new() -> AddElementState {
        AddElementState {
            new_placement: json!({"x": 1, "y": 1, "w": 1, "h": 1}).as_object().unwrap().clone(),
            new_id: "".to_string(),
            is_active: false,
        }
    }
}

pub fn on_add_new_event(handle: &AppHandle, event: tauri::Event) {
    let data = match crate::ipc::get_json_from_event(handle, event) {
        Some(v) => v.as_object().cloned(),
        None => None,
    };
    add_new_element(handle, data);
}

pub fn add_new_element(app_handle: &AppHandle, element_data: Option<Map<String, Value>>) {
    let ae_state = AddElementState::new();
    let old_data = app_handle.state::<EditorState>().get_data();
    let add = CharacterDataCommand::add_element(old_data, ae_state.new_id, element_data, ae_state.new_placement);
    let _ = app_handle.state::<EditorState>().change_data(add);
}
