//! loads cofig data and passes it to the respective modules
use serde_json::{Map, Value};
use std::collections::{BTreeMap, HashMap};
use std::fs::File;
use std::io::{BufReader, Read};
use std::path::PathBuf;
use std::str::FromStr;
use std::sync::Mutex;

use tauri::AppHandle;

use crate::ipc::{emit_tauri_error, emit_tauri_log, AppEvent, PressedKey};

use super::LoadedShortcuts;

pub struct ConfigState {
    pub data: Mutex<Config>,
}

impl ConfigState {
    pub fn open(app_handle: &AppHandle) -> ConfigState {
        let mut config = Config::new();
        config.use_saved_config(app_handle);
        ConfigState {
            data: Mutex::from(config),
        }
    }

    pub fn save_to_disk(&self, app_handle: &AppHandle) {
        self.data.lock().unwrap().save(app_handle);
    }

    pub fn load_shortcuts(&self, app_handle: &AppHandle) -> LoadedShortcuts {
        self.data
            .lock()
            .unwrap()
            .load_shortcuts_from_config(app_handle)
    }

    pub fn apply_changes(&self, changes: Map<String, Value>) -> Result<(), String> {
        self.data.lock().unwrap().apply_changes(changes)
    }

    pub fn get_raw(&self) -> Value {
        self.data.lock().unwrap().as_value()
    }

    pub fn get_accel(&self, action: AppEvent) -> String {
        self.data
            .lock()
            .unwrap()
            .get_shortcuts_from_config()
            .get(&action)
            .and_then(|v| v.first())
            .and_then(|k| Some(k.get_accelerator()))
            .unwrap_or("unknown".to_string())
    }
}
pub struct Config {
    data: Map<String, Value>,
}

impl Config {
    fn new() -> Config {
        Config {
            data: Self::default(),
        }
    }

    fn default() -> Map<String, Value> {
        let mut shortcuts = Map::new();
        let mut insert_binding = |e: AppEvent, k: PressedKey| {
            shortcuts.insert(e.to_string(), k.as_value());
        };
        insert_binding(AppEvent::FileNew, PressedKey::ctrl_and("KeyN"));
        insert_binding(AppEvent::FileOpen, PressedKey::ctrl_and("KeyO"));
        insert_binding(AppEvent::FileSave, PressedKey::ctrl_and("KeyS"));
        insert_binding(AppEvent::FileSaveAs, PressedKey::ctrl_shift_and("KeyS"));
        insert_binding(AppEvent::ActionUndo, PressedKey::ctrl_and("KeyZ"));
        insert_binding(AppEvent::ActionRedo, PressedKey::ctrl_and("KeyY"));
        insert_binding(AppEvent::WindowAddElement, PressedKey::ctrl_and("KeyE"));
        insert_binding(AppEvent::WindowDebug, PressedKey::ctrl_and("Digit0"));
        insert_binding(AppEvent::ModReadOnly, PressedKey::ctrl_and("Digit1"));
        insert_binding(AppEvent::ModGridEdit, PressedKey::ctrl_and("Digit2"));
        insert_binding(AppEvent::ModElementEdit, PressedKey::ctrl_and("Digit3"));

        let mut data = Map::new();
        data.insert("shortcuts".to_string(), Value::Object(shortcuts));
        data
    }

    pub fn use_saved_config(&mut self, app_handle: &AppHandle) {
        let data_dir_path = match app_handle.path_resolver().app_data_dir() {
            Some(p) => p,
            None => {
                emit_tauri_error(app_handle, "app data directory not provided".to_string());
                return;
            }
        };
        let config_file_path = data_dir_path.join::<PathBuf>("config.json".into());
        let file = match File::open(config_file_path) {
            Ok(f) => f,
            Err(e) => {
                emit_tauri_error(app_handle, format!("couldn't open config file: {e}"));
                return;
            }
        };
        let mut buffer = String::new();
        match BufReader::new(file).read_to_string(&mut buffer) {
            Ok(b) => emit_tauri_log(app_handle, format!("read {b} bytes from config file")),
            Err(e) => {
                emit_tauri_error(app_handle, format!("error when reading config file: {e}"));
                return;
            }
        }
        let config_value = match Value::from_str(&buffer) {
            Ok(v) => v,
            Err(e) => {
                emit_tauri_error(app_handle, format!("couldn't parse config data: {e}"));
                return;
            }
        };

        let saved_config = match config_value.as_object() {
            Some(o) => o,
            None => {
                emit_tauri_error(app_handle, format!("couldn't parse config data as object"));
                return;
            }
        };

        match saved_config.get("shortcuts").and_then(Value::as_object) {
            Some(s) => {
                for (k, v) in s {
                    let ev = self
                        .data
                        .get_mut("shortcuts")
                        .and_then(Value::as_object_mut)
                        .unwrap()
                        .entry(k)
                        .or_insert(Value::Null);
                    *ev = v.clone();
                }
            }
            None => {}
        }
    }

    pub fn save(&self, app_handle: &AppHandle) {
        let data_dir_path = match app_handle.path_resolver().app_data_dir() {
            Some(p) => p,
            None => {
                emit_tauri_error(app_handle, "app data directory not provided".to_string());
                return;
            }
        };
        let config_file_path = data_dir_path.join::<PathBuf>("config.json".into());
        let file = match std::fs::OpenOptions::new()
            .create(true)
            .write(true)
            .open(config_file_path)
        {
            Ok(f) => f,
            Err(e) => {
                emit_tauri_error(
                    app_handle,
                    format!("error when opening config file: {}", e.to_string()),
                );
                return;
            }
        };
        let writer = std::io::BufWriter::new(file);

        let mut diff = Map::new();
        let default = Self::default();
        for (f, fv) in default {
            let diff_field = diff
                .entry(f.clone())
                .or_insert(Value::Object(Map::new()))
                .as_object_mut()
                .unwrap();
            let modified_values = self.data.get(&f).and_then(Value::as_object).unwrap();
            for (k, ev) in modified_values {
                if fv.get(k) != Some(ev) {
                    diff_field.insert(k.clone(), ev.clone());
                }
            }
        }

        match serde_json::to_writer(writer, &Value::Object(diff)) {
            Err(e) => {
                emit_tauri_error(
                    app_handle,
                    format!("error when writing config file: {}", e.to_string()),
                );
            }
            _ => {}
        }
    }

    pub fn as_value(&self) -> Value {
        return Value::Object(self.data.clone());
    }

    pub fn from_value(value: Value) -> Option<Self> {
        match value.as_object() {
            Some(o) => return Some(Config { data: o.clone() }),
            None => None,
        }
    }

    pub fn apply_changes(&mut self, changes: Map<String, Value>) -> Result<(), String> {
        for (id, mut change) in changes.into_iter() {
            match (
                change.is_object(),
                self.data.get_mut(&id).and_then(|v| v.as_object_mut()),
            ) {
                (false, _) | (true, None) => *self.data.entry(id).or_insert(Value::Null) = change,
                (true, Some(o)) => o.append(&mut change.as_object_mut().unwrap()),
            }
        }
        Ok(())
    }

    pub fn get_shortcuts_from_config(&mut self) -> BTreeMap<AppEvent, Vec<PressedKey>> {
        let mut shortcut_map = BTreeMap::new();
        let shortcuts = self
            .data
            .get("shortcuts")
            .and_then(Value::as_object)
            .unwrap();
        for (key, val) in shortcuts {
            let codes = if val.is_array() {
                val.as_array()
                    .unwrap()
                    .into_iter()
                    .map(|i| PressedKey::from_json(i))
                    .collect()
            } else {
                vec![PressedKey::from_json(val)]
            };
            shortcut_map.insert(AppEvent::from(key.as_str()), codes);
        }
        shortcut_map
    }

    pub fn load_shortcuts_from_config(&mut self, app_handle: &AppHandle) -> LoadedShortcuts {
        let shortcuts = self.get_shortcuts_from_config();
        let mut shortcut_map = HashMap::<PressedKey, AppEvent>::new();
        for (action, shortcuts) in shortcuts.into_iter() {
            for shortcut in shortcuts {
                if shortcut_map.contains_key(&shortcut) {
                    emit_tauri_error(
                        app_handle,
                        format!(
                            "shortcuts have conflicting keybindings: {} and {} binded to {}",
                            shortcut_map.get(&shortcut).unwrap().to_string(),
                            action.to_string(),
                            shortcut.get_accelerator()
                        ),
                    );
                    continue;
                }
                shortcut_map.insert(shortcut, action);
            }
        }
        LoadedShortcuts::from_map(shortcut_map)
    }
}