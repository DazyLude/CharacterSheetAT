use crate::command::{Command, Commandable};

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

pub struct CharacterDataCommand {
    old: CharacterData,
    new: CharacterData,
}

impl CharacterDataCommand {
    pub fn from_old_and_new(old: CharacterData, new: CharacterData) -> CharacterDataCommand {
        CharacterDataCommand {
            old,
            new
        }
    }
}
impl Commandable for CharacterData {}
impl Command<CharacterData> for CharacterDataCommand {
    fn execute(&self, apply_to: &mut CharacterData) {
        *apply_to = self.new.clone();
    }
    fn undo(&self, apply_to: &mut CharacterData) {
        *apply_to = self.old.clone();
    }
}

impl<'a> CharacterData {
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
    pub fn edit_global(&mut self, global_name: String, new_value: Value) -> Option<()> {
        self.globals.entry(global_name).and_modify(|v| *v = new_value.clone()).or_insert(new_value);

        Some(())
    }
    pub fn edit_grid(&mut self, id: String, value_name: String, new_value: Value) -> Option<()> {
        let closure = |v: &mut Value| {Self::modify_closure(v, value_name.clone(), &new_value)};
        self.grid.entry(id)
            .and_modify(closure)
            .or_insert(serde_json::from_value(json!({value_name: new_value})).unwrap());

        Some(())
    }
    pub fn edit_element(&mut self, id: String, value_name: String, new_value: Value) -> Option<()> {
        let closure = |v: &mut Value| {Self::modify_closure(v, value_name.clone(), &new_value)};
        self.elements.entry(id)
            .and_modify(closure)
            .or_insert(serde_json::from_value(json!({value_name: new_value})).unwrap());

        Some(())
    }
    /// merge_* function family merges old data with new for a specific id. Works only with objects
    pub fn merge_global(&mut self, global_name: String, merge_object: Map<String, Value>) -> Option<()> {
        let closure = |v: &mut Value| {
            match v.as_object_mut() {
                Some(m) => m.append(&mut merge_object.clone()),
                None => return,
            }
        };
        self.globals.entry(global_name).and_modify(closure).or_insert(Value::Object(merge_object));

        Some(())
    }
    pub fn merge_grid(&mut self, id: String, merge_object: Map<String, Value>) -> Option<()> {
        let closure = |v: &mut Value| {
            match v.as_object_mut() {
                Some(m) => m.append(&mut merge_object.clone()),
                None => return,
            }
        };
        self.grid.entry(id).and_modify(closure).or_insert(Value::Object(merge_object));

        Some(())
    }
    pub fn merge_element(&mut self, id: String, merge_object: Map<String, Value>) -> Option<()> {
        let closure = |v: &mut Value| {
            match v.as_object_mut() {
                Some(m) => m.append(&mut merge_object.clone()),
                None => return,
            }
        };
        self.elements.entry(id).and_modify(closure).or_insert(Value::Object(merge_object));

        Some(())
    }

    /// get_element_data takes an id of an element, and returns it's data object's mutable reference
    /// if it has data field, but it's not an object, then None is returned
    fn get_element_data(&'a mut self, id: String) -> Option<&'a mut Map<String, Value>> {
        let get_data = |v : &'a mut Map<String, Value>| {
            v.get_mut("data").and_then(Value::as_object_mut)
        };

        self.elements.get_mut(&id).and_then(Value::as_object_mut).and_then(get_data)
    }

    /// *_set method family works with element-associated data objects.
    pub fn add_to_set(&mut self, id: String, name: String, value: Value) -> Option<()> {
        let element_data = self.get_element_data(id)?;
        element_data.entry(name).or_insert(value);

        Some(())
    }

    pub fn remove_from_set(&mut self, id: String, name: String) -> Option<()> {
        let data = self.get_element_data(id)?;
        data.remove(&name)?;

        Some(())
    }

    pub fn merge_with_set_item(&'a mut self, id: String, item_name: String, merge_object: Map<String, Value>) -> Option<()> {
        let get_item = |v : &'a mut Map<String, Value>| {
            v.get_mut(&item_name).and_then(Value::as_object_mut)
        };

        let item_data = self.get_element_data(id).and_then(get_item)?;
        item_data.append(&mut merge_object.clone());

        Some(())
    }
    pub fn remove_by_id(&mut self, id: String) -> Option<()> {
        self.elements.remove(&id);
        self.grid.remove(&id);
        Some(())
    }

    pub fn as_value(&self) -> Value {
        let mut as_map = Map::new();
        as_map.insert("globals".to_string(), Value::Object(self.globals.clone()));
        as_map.insert("grid".to_string(), Value::Object(self.grid.clone()));
        as_map.insert("elements".to_string(), Value::Object(self.elements.clone()));
        Value::Object(as_map)
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