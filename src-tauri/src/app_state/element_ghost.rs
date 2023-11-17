//! Editor ghost is an entity which is used to communicate new element placement between AddElementWindow and EditorWindow.
//! The EditorWindow displays the placement as the grid element.
//! The AddElementWindow displays the coordinates of the element in textual format.

use std::sync::Mutex;
use std::collections::HashMap;
use serde_json::{ Value, Map };
use tauri::{AppHandle, Manager};
use crate::windows::EditorStateSync;

pub struct ElementGhost {
    placement: Mutex<HashMap<String, Value>>,
    pub displayed: Mutex<bool>,
}

fn shout_update_ghost(handle: &AppHandle) {
    let _ = handle.emit_all("update_ghost", {});
}


impl ElementGhost {
    pub fn new() -> Self {
        let value_of_two = Value::Number(serde_json::Number::from(2));
        let map = HashMap::from([
            ("x".to_string(), value_of_two.clone()),
            ("y".to_string(), value_of_two.clone()),
            ("w".to_string(), value_of_two.clone()),
            ("h".to_string(), value_of_two.clone()),
            ("type".to_string(), Value::String("div".to_string())),
        ]);
        ElementGhost {
            placement: Mutex::from(map),
            displayed: Mutex::from(false),
        }
    }

    pub fn get_placement_as_map(&self) -> Map<String, Value> {
        Map::from_iter(self.placement.lock().unwrap().clone().into_iter())
    }

    pub fn set_to_unnocupied_space(&self, handle: &AppHandle) {
        let get_row_below = |(_k, v): (&String, &Value)| -> i64 {
            let y = v.get("y").and_then(Value::as_i64).unwrap_or(0);
            let h = v.get("h").and_then(Value::as_i64).unwrap_or(0);
            y + h
        };

        let lowest_row = match handle.try_state::<EditorStateSync>() {
            None => return,
            Some(st) => st.get_data().get_grid().iter().map(get_row_below).max().unwrap_or(0)
        };

        self.entry_and_modify(
                "y".to_string(),
                |n| *n = Value::Number(serde_json::Number::from(lowest_row)),
                handle
            );
        }

    pub fn entry_and_modify<F>(&self, k: String, f: F, handle: &AppHandle) -> ()
        where F: FnOnce(&mut Value), {
        self.placement.lock().unwrap().entry(k).and_modify(f);
        shout_update_ghost(handle);
    }

    pub fn show(&self, handle: &AppHandle) {
        * self.displayed.lock().unwrap() = true;
        shout_update_ghost(handle);

    }
    pub fn hide(&self, handle: &AppHandle) {
        * self.displayed.lock().unwrap() = false;
        shout_update_ghost(handle);
    }

    pub fn update_placement(&self, new_placement: Map<String, Value>, handle: &AppHandle) {
        let mut placement = self.placement.lock().unwrap().clone();
        for coordinate in new_placement {
            placement.insert(coordinate.0, coordinate.1);
        }
        *self.placement.lock().unwrap() = placement;

        shout_update_ghost(handle);
    }
}