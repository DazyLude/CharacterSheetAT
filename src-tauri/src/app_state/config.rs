//! loads cofig data and passes it to the respective modules
use serde_json::{Map, Value};
use std::collections::{BTreeMap, HashMap};
use std::path::PathBuf;
use std::sync::Mutex;

use tauri::AppHandle;

use crate::disk_interactions::{load_json_from_disk, save_json_to_disk};
use crate::ipc::{emit_tauri_error, AppEvent, PressedKey};

use super::{CatalogueItemType, LoadedShortcuts};

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

    pub fn load_catalogues(&self, app_handle: &AppHandle) -> Vec<(CatalogueItemType, Map<String, Value>)> {
        self.data.lock().unwrap().load_catalogues(app_handle)
    }

    pub fn add_catalogue(&self, items_type: CatalogueItemType, path: PathBuf) {
        self.data.lock().unwrap().add_catalogue(items_type, path)
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
        data.insert("catalogues".to_string(), Value::Array(Vec::new()));
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

        let config_value = match load_json_from_disk(&config_file_path) {
            Ok(v) => v,
            Err(e) => {
                emit_tauri_error(app_handle, e);
                return;
            },
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

        match saved_config.get("catalogues").and_then(Value::as_array) {
            Some(a) => {
                for c in a {
                    let (items_type, path) = match c.as_object() {
                        Some(o) => {
                            let t = o.get("type").and_then(Value::as_str);
                            let p = o.get("path").and_then(Value::as_str);
                            match (t, p) {
                                (Some(st), Some(sp)) => (st.to_string(), sp.to_string()),
                                (_, _) => continue,
                            }

                        }
                        None => continue,
                    };
                    let mut cat = Map::new();
                    cat.insert("type".to_string(), Value::String(items_type));
                    cat.insert("path".to_string(), Value::String(path));
                    self.data.get_mut("catalogues").and_then(Value::as_array_mut).unwrap().push(c.clone());
                }
            },
            None => {}
        }
    }

    pub fn save(&self, app_handle: &AppHandle) {
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
        let data_dir_path = match app_handle.path_resolver().app_data_dir() {
            Some(p) => p,
            None => {
                emit_tauri_error(app_handle, "app data directory not provided".to_string());
                return;
            }
        };
        let config_file_path = data_dir_path.join::<PathBuf>("config.json".into());
        save_json_to_disk(app_handle, &config_file_path, Value::Object(diff));
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

    pub fn load_catalogues(&self, app_handle: &AppHandle) -> Vec<(CatalogueItemType, Map<String, Value>)> {
        let cats = self.data.get("catalogues").and_then(Value::as_array).unwrap();
        let mut loaded_cats = Vec::new();
        for cat in cats {
            let cat = cat.as_object().unwrap();
            let item_type : CatalogueItemType = cat.get("type").and_then(Value::as_str).unwrap().into();
            let catalogue_path : PathBuf = cat.get("path").and_then(Value::as_str).unwrap().into();
            let catalogue_unchecked = match load_json_from_disk(&catalogue_path) {
                Ok(v) => v,
                Err(e) => {
                    emit_tauri_error(app_handle, e);
                    continue;
                },
            };
            let catalogue = match catalogue_unchecked.as_object().and_then(|o| o.get("data")).and_then(Value::as_object) {
                Some(o) => o.clone(),
                None => {
                    emit_tauri_error(app_handle, format!("unknown catalogue format: {:?}", catalogue_unchecked));
                    continue;
                },
            };
            loaded_cats.push((item_type, catalogue));
        }

        loaded_cats
    }

    pub fn add_catalogue(&mut self, items_type: CatalogueItemType, path: PathBuf) {
        let cats = self.data.get_mut("catalogues").and_then(Value::as_array_mut).unwrap();
        let mut catalogue_obj = Map::new();
        catalogue_obj.insert("type".to_string(), Value::String(items_type.to_string()));
        catalogue_obj.insert("path".to_string(), Value::String(path.to_string_lossy().to_string()));
        cats.push(Value::Object(catalogue_obj));
    }
}
