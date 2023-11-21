use std::sync::Mutex;

use tauri::{AppHandle, Manager, WindowEvent};
use serde_json::{Value, Map};

use crate::{
    character_data::CharacterDataCommand,
    ipc::{get_json_from_event, emit_tauri_error},
    app_state::ElementGhost
};

use crate::funny_constants::APP_NAME;
use super::{ CSATWindow, EditorStateSync };

pub struct AddElementWindow {}


impl CSATWindow for AddElementWindow {
    const LABEL: &'static str = "add_element";
    fn builder(app_handle: &AppHandle) {
        let _ = app_handle.manage(AddElementStateSync::new());
        app_handle.state::<ElementGhost>().set_to_unnocupied_space(app_handle);
        app_handle.state::<ElementGhost>().show(app_handle);
        let handle = app_handle.clone();
        std::thread::spawn(
            move || {
                let w = match tauri::WindowBuilder::new(
                    &handle,
                    Self::LABEL,
                    tauri::WindowUrl::App("add_element".into())
                )
                .title(&(APP_NAME.to_string() + " editor: add element"))
                .fullscreen(false)
                .resizable(false)
                .minimizable(false)
                .inner_size(522., 253.)
                .build()
                {
                    Ok(w) => w,
                    Err(e) => {
                        emit_tauri_error(&handle, e.to_string());
                        return;
                    },
                };
                let h = handle.clone();
                w.listen("add_new_element", move |e| {on_add_new_element_event(&h, e)});
                let h = handle.clone();
                w.listen("change_add_element_state", move |e| {on_change_state_event(&h, e)});
            }
        );
    }

    fn run_event_handler(app_handle: &AppHandle, event: WindowEvent) {
        match event {
            WindowEvent::Focused(true) => {
            }
            WindowEvent::CloseRequested { .. } => {
                app_handle.state::<ElementGhost>().hide(app_handle);
            }
            _ => {}
        }
    }
}

fn on_add_new_element_event(app_handle: &AppHandle, event: tauri::Event) {
    let id = match app_handle.try_state::<AddElementStateSync>() {
        Some(state) => state.get_cloned_state().id,
        None => return,
    };
    let old_editor_data = match app_handle.try_state::<EditorStateSync>() {
        Some(state) => state.get_data(),
        None => return,
    };
    let placement = app_handle.state::<ElementGhost>().get_placement_as_map();

    let element_data = get_json_from_event(event).as_ref().and_then(Value::as_object).cloned();

    let add = CharacterDataCommand::add_element(old_editor_data, element_data, id, placement);
    let _ = app_handle.state::<EditorStateSync>().change_data(add, app_handle);
    app_handle.state::<ElementGhost>().set_to_unnocupied_space(app_handle);
    app_handle.state::<AddElementStateSync>().set_inactive(app_handle);
}

fn on_change_state_event(handle: &AppHandle, event: tauri::Event) {
    let new_data_object = match get_json_from_event(event) {
        Some(v) => v.as_object().unwrap().clone(),
        None => {
            emit_tauri_error(handle, "got an empty payload on change_add_element_state event".to_string());
            return;
        },
    };
    let mut old_data = match handle.try_state::<AddElementStateSync>() {
        Some(state) => state.get_cloned_state(),
        None => return,
    };

    match new_data_object.get("id").and_then(Value::as_str) {
        Some(id) => {
            old_data.id = id.to_string();
            old_data.is_active = check_id_availability(handle, &old_data.id);
        },
        None => {},
    }

    match new_data_object.get("placement").and_then(Value::as_object) {
        Some(pl) => handle.state::<ElementGhost>().update_placement(pl.clone(), handle),
        None => {},
    };

    handle.state::<AddElementStateSync>().set_new_state(old_data, handle);
}

fn update_window(handle: &AppHandle) {
    let _ = handle.emit_to("add_element", "new_data", {});
}

pub struct AddElementStateSync {
    state: Mutex<AddElementState>,
}

impl AddElementStateSync {
    pub fn as_value(&self) -> serde_json::Value {
        self.state.lock().unwrap().as_value()
    }

    pub fn get_cloned_state(&self) -> AddElementState {
        self.state.lock().unwrap().clone()
    }

    pub fn set_new_state(&self, new_state: AddElementState, handle: &AppHandle) {
        *self.state.lock().unwrap() = new_state;
        update_window(handle);
    }

    pub fn set_inactive(&self, handle: &AppHandle) {
        self.state.lock().unwrap().is_active = false;
        update_window(handle);
    }

    pub fn new() -> Self {
        Self { state: Mutex::from(AddElementState::new()) }
    }
}

#[derive(Clone)]
pub struct AddElementState {
    pub id: String,
    pub is_active: bool,
}

impl AddElementState {
    pub fn new() -> AddElementState {
        AddElementState {
            id: "".to_string(),
            is_active: false,
        }
    }

    pub fn as_value(&self) -> Value {
        let mut state_obj = Map::<String, Value>::new();
        state_obj.insert(
            "id".to_string(),
            Value::String(self.id.clone())
        );
        state_obj.insert(
            "is_active".to_string(),
            Value::Bool(self.is_active)
        );

        Value::Object(state_obj)
    }
}

fn check_id_availability(app_handle: &AppHandle, id: &String) -> bool {
    match app_handle.try_state::<EditorStateSync>() {
        Some(st) => st.get_data().check_id(id),
        None => false,
    }
}