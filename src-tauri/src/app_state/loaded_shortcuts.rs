use std::collections::HashMap;
use std::sync::Mutex;
use crate::ipc::PressedKey;

pub struct LoadedShortcuts {
    shortcuts: Mutex<HashMap<PressedKey, String>>
}

impl LoadedShortcuts {
    pub fn get_default() -> LoadedShortcuts {
        let mut loaded_shortcuts : HashMap<PressedKey, String> = HashMap::new();
        loaded_shortcuts.insert(PressedKey::compose(true, false, "KeyS".to_string()), "save".into());
        loaded_shortcuts.insert(PressedKey::compose(true, false, "KeyZ".to_string()), "undo".into());
        loaded_shortcuts.insert(PressedKey::compose(true, false, "KeyY".to_string()), "redo".into());
        loaded_shortcuts.insert(PressedKey::compose(true, false, "KeyE".to_string()), "open-add".into());
        loaded_shortcuts.insert(PressedKey::compose(true, false, "Digit1".to_string()), "mod1".into());
        loaded_shortcuts.insert(PressedKey::compose(true, false, "Digit2".to_string()), "mod2".into());
        loaded_shortcuts.insert(PressedKey::compose(true, false, "Digit3".to_string()), "mod3".into());

        LoadedShortcuts { shortcuts: Mutex::from(loaded_shortcuts) }
    }

    pub fn get_entry(& self, key: &PressedKey) -> Option<String> {
        self.shortcuts.lock().unwrap().get(key).cloned()
    }
}