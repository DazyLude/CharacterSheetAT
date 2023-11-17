//! Editor ghost is an entity which is used to communicate new element placement between AddElementWindow and EditorWindow.
//! The EditorWindow displays the placement as the grid element.
//! The AddElementWindow displays the coordinates of the element in textual format.

use std::sync::Mutex;
use std::collections::HashMap;
use serde_json::{ Value, Map };

pub struct ElementGhost {
    pub placement: Mutex<HashMap<String, Value>>,
}

impl ElementGhost {
    pub fn new() -> Self {
        let value_of_one = Value::Number(serde_json::Number::from(1));
        let map = HashMap::from([
            ("x".to_string(), value_of_one.clone()),
            ("y".to_string(), value_of_one.clone()),
            ("w".to_string(), value_of_one.clone()),
            ("h".to_string(), value_of_one.clone()),
            ("type".to_string(), Value::String("div".to_string())),
        ]);
        ElementGhost {
            placement: Mutex::from(map),
        }
    }

    pub fn entry_and_modify<F>(&self, k: String, f: F) -> ()
        where F: FnOnce(&mut Value), {
        self.placement.lock().unwrap().entry(k).and_modify(f);
    }

    pub fn get_placement_as_map(&self) -> Map<String, Value> {
        Map::from_iter(self.placement.lock().unwrap().clone().into_iter())
    }

    pub fn update_placement(&self, new_placement: Map<String, Value>) {
        let mut placement = self.placement.lock().unwrap().clone();
        for coordinate in new_placement {
            placement.insert(coordinate.0, coordinate.1);
        }
        *self.placement.lock().unwrap() = placement;
    }
}