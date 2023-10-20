use serde_json::{Value, Map, json};

/// Where goes what:
/// # globals
/// weakly typed data that associate with a character, rather than the GUI element
/// for example: stats, expertises, AC, Name etc.
/// # grid
/// strongly typed data used for page layout rendering
/// # elements
/// weakly typed data that associates with a GUI element, rather than with a character
/// for example: text box text, image's location and caption etc.
#[derive(Debug, Clone)]
pub struct CharacterData {
    globals: Map<String, Value>,
    grid: Map<String, Value>,
    elements: Map<String, Value>,
}

impl CharacterData {
    pub fn generate_empty() -> Self {
        let empty_globals = serde_json::from_str(r#"{
            "stats": {},
            "proficiencies": {},
            "health": {},
            "hitdice": {}
        }"#).unwrap();

        let empty_grid = serde_json::from_str("{}").unwrap();
        let empty_elements = serde_json::from_str("{}").unwrap();

        CharacterData {
            globals: empty_globals,
            grid: empty_grid,
            elements: empty_elements,
        }
    }

    fn modify_closure(v: &mut Value, v_n: String, n_v: &Value) {
        v.as_object_mut().unwrap().insert(v_n.clone(), n_v.clone());
    }
    /// edit_* function family edits or inserts 1 entry. Works with any value.
    pub fn edit_global(&mut self, global_name: String, new_value: Value) {
        self.globals.entry(global_name).and_modify(|v| *v = new_value.clone()).or_insert(new_value);
    }
    pub fn edit_grid(&mut self, id: String, value_name: String, new_value: Value) {
        let closure = |v: &mut Value| {Self::modify_closure(v, value_name.clone(), &new_value)};
        self.grid.entry(id)
            .and_modify(closure)
            .or_insert(serde_json::from_value(json!({value_name: new_value})).unwrap());
    }
    pub fn edit_element(&mut self, id: String, value_name: String, new_value: Value) {
        let closure = |v: &mut Value| {Self::modify_closure(v, value_name.clone(), &new_value)};
        self.elements.entry(id)
            .and_modify(closure)
            .or_insert(serde_json::from_value(json!({value_name: new_value})).unwrap());
    }
    /// merge_* function family merges old data with new for a specific id. Works only with objects.
    pub fn merge_global(&mut self, global_name: String, merge_object: Map<String, Value>) {
        let closure = |v: &mut Value| {
            match v.as_object_mut() {
                Some(m) => m.append(&mut merge_object.clone()),
                None => return,
            }
        };
        self.globals.entry(global_name).and_modify(closure).or_insert(Value::Object(merge_object));
    }
    pub fn merge_grid(&mut self, id: String, merge_object: Map<String, Value>) {
        let closure = |v: &mut Value| {
            match v.as_object_mut() {
                Some(m) => m.append(&mut merge_object.clone()),
                None => return,
            }
        };
        self.grid.entry(id).and_modify(closure).or_insert(Value::Object(merge_object));
    }
    pub fn merge_element(&mut self, id: String, merge_object: Map<String, Value>) {
        let closure = |v: &mut Value| {
            match v.as_object_mut() {
                Some(m) => m.append(&mut merge_object.clone()),
                None => return,
            }
        };
        self.elements.entry(id).and_modify(closure).or_insert(Value::Object(merge_object));
    }
    /// *_set method family works with element-associated data objects.
    pub fn add_to_set(&mut self, id: String, name: String, value: Value) {

        self.elements.entry(&id).and_modify(
            |element_object| {
                element_object.as_object_mut().unwrap().entry("data").and_modify(
                    |element_data| {
                       element_data.as_object_mut().unwrap().entry(name).or_insert(value);
                    }
                );
            });

    }
    pub fn remove_from_set(&mut self, id: String, name: String) {
        match self.elements.get_mut(&id) {
            None => return,
            Some(maybe_obj) => match maybe_obj.as_object_mut() {
                None => return,
                Some(obj) => match obj.get_mut("data") {
                    None => return,
                    Some(data_maybe_obj) => match data_maybe_obj.as_object_mut() {
                        None => return,
                        Some(data_obj) => data_obj.remove(&name),
                    }
                }
            }
        };
    }
    pub fn merge_with_set_item(&mut self, id: String, item_name: String, merge_object: Map<String, Value>) {
        match self.elements.get_mut(&id) {
            None => return,
            Some(maybe_obj) => match maybe_obj.as_object_mut() {
                None => return,
                Some(obj) => match obj.get_mut("data") {
                    None => return,
                    Some(data_maybe_obj) => match data_maybe_obj.as_object_mut() {
                        None => return,
                        Some(data_obj) => match data_obj.get_mut(&item_name) {
                            None => return,
                            Some(maybe_item_data) => match maybe_item_data.as_object_mut() {
                                None => return,
                                Some(item_data) => item_data.append(&mut merge_object.clone()),
                            }
                        },
                    }
                }
            }
        };
    }

    pub fn as_value(&self) -> Value {
        let mut as_map = Map::new();
        as_map.insert("globals".to_string(), Value::Object(self.globals.clone()));
        as_map.insert("grid".to_string(), Value::Object(self.grid.clone()));
        as_map.insert("elements".to_string(), Value::Object(self.elements.clone()));
        Value::Object(as_map)
    }

    pub fn remove_by_id(&mut self, id: String) {
        self.elements.remove(&id);
        self.grid.remove(&id);
    }
}

impl From<Value> for CharacterData {
    fn from(value: Value) -> Self {
        let json_globals = match &value["globals"] {
            Value::Object(v) => v,
            _ => return CharacterData::generate_empty(),
        };
        let json_grid = match &value["grid"] {
            Value::Object(v) => v,
            _ => return CharacterData::generate_empty(),
        };
        let element_grid = match &value["elements"] {
            Value::Object(v) => v,
            _ => return CharacterData::generate_empty(),
        };
        CharacterData {
            globals: json_globals.clone(),
            grid: json_grid.clone(),
            elements: element_grid.clone(),
        }
    }
}