use serde_json::{Value, Map, json};
mod events;
mod commands;

pub use commands::*;
pub use events::*;

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

impl From<Value> for ChangeJSON {
    fn from(v: Value) -> Self {
        let v_o = v.as_object();
        let mut c_v = ChangeJSON {
            value_type: "undefined".to_string(),
            id: None,
            value_name: None,
            new_value: None,
            merge_object: None,
        };

        match v_o {
            None => {},
            Some(o) => {
                c_v.value_type = o.get("value_type").and_then(Value::as_str).unwrap_or("undefined").to_string();
                c_v.id = o.get("id").and_then(Value::as_str).map(str::to_string);
                c_v.value_name = o.get("value_name").and_then(Value::as_str).map(str::to_string);
                c_v.new_value = o.get("new_value").cloned();
                c_v.merge_object = o.get("merge_object").and_then(Value::as_object).cloned();
            }
        }

        c_v
    }
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