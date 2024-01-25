use std::collections::HashMap;
use std::sync::Mutex;
use crate::ipc::{PressedKey, AppEvent};

pub struct LoadedShortcuts {
    pub shortcuts: Mutex<HashMap<PressedKey, AppEvent>>
}

impl LoadedShortcuts {
    pub fn from_map(map: HashMap<PressedKey, AppEvent>) -> LoadedShortcuts {
        LoadedShortcuts { shortcuts: Mutex::from(map) }
    }

    pub fn get_entry(&self, key: &PressedKey) -> Option<AppEvent> {
        self.shortcuts.lock().unwrap().get(key).copied()
    }
}