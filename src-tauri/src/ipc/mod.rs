mod events;
mod commands;

pub use commands::*;
pub use events::*;
use serde_json::{Value, Map, json};

/// Just a JSON value
#[derive(Clone, serde::Serialize, serde::Deserialize)]
pub struct PayloadJSON {
    pub data: Value,
}

/// struct used to issue changes to EditorState
#[derive(Clone, Debug, serde::Serialize, serde::Deserialize)]
pub struct ChangeJSON {
    pub value_type: String,
    pub id: Option<String>,
    pub value_name: Option<String>,
    pub new_value: Option<Value>,
    pub merge_object: Option<Map<String, Value>>,
}

/// Struct used to communicate pressed keys from frontend.
#[derive(serde::Deserialize, Debug, Eq, PartialEq, Hash)]
pub struct PressedKey {
    ctrl_key: bool,
    alt_key: bool,
    key_code: String,
}

impl<'a> PressedKey {
    pub fn decompose(&'a self) -> (bool, bool, &'a str) {
        (self.ctrl_key, self.alt_key, self.key_code.as_str())
    }
    pub fn compose(ctrl_key: bool, alt_key: bool, key_code: String) -> PressedKey {
        PressedKey { ctrl_key, alt_key, key_code }
    }

    pub fn from_json(v: Value) -> PressedKey {
        let empty = json!({}).as_object().unwrap().clone();
        let v_o = v.as_object().unwrap_or(&empty);
        PressedKey {
            ctrl_key: v_o.get("ctrl_key").and_then(Value::as_bool).unwrap_or(false),
            alt_key: v_o.get("alt_key").and_then(Value::as_bool).unwrap_or(false),
            key_code: v_o.get("key_code").and_then(Value::as_str).unwrap_or("KeyH").to_string(),
        }
    }
}