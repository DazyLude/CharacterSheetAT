use serde_json::{Value, Map, Number};

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct CharacterData {
    variables: Map<String, Value>,
    globals: Map<String, Value>,
    grid: Map<String, Value>,
    elements: Map<String, Value>,
}

impl CharacterData {
    pub fn generate_empty() -> Self {
        CharacterData {
            variables: Map::new(),
            globals: Map::new(),
            grid: Map::new(),
            elements: Map::new(),
        }
    }

    /// edit_global replaces existing global variable with a new value
    pub fn edit_global(&mut self, global_name: String, new_value: Value) -> Option<()> {
        *self.globals.entry(global_name).or_insert(Value::Null) = new_value;
        Some(())
    }
    /// merge_global merges an existing global variable, if it is an object, with another object
    pub fn merge_global(&mut self, global_name: String, mut merge_object: Map<String, Value>) -> Option<()> {
        match self.globals.entry(global_name).or_insert(Value::Object(Map::new())).as_object_mut() {
            Some(m) => m.append(&mut merge_object),
            None => return None,
        }
        Some(())
    }

    pub fn add_to_global_set(&mut self, global_name: String, entry_name: String, value: Value) -> Option<()> {
        let element_data = match self
            .globals
            .entry(&global_name)
            .or_insert(Value::Object(Map::new()))
            .as_object_mut()
            .unwrap()
            .entry("data")
            .or_insert(Value::Object(Map::new()))
            .as_object_mut() {
            Some(d) => d,
            None => return None,
        };
        *element_data.entry(entry_name).or_insert(Value::Null) = value;
        Some(())
    }

    pub fn remove_from_global_set(&mut self, global_name: String, entry_name: String) -> Option<()> {
        let element_data = match self
            .globals
            .get_mut(&global_name)
            .and_then(Value::as_object_mut)
            .and_then(|o| o.get_mut("data"))
            .and_then(Value::as_object_mut) {
            Some(d) => d,
            None => return None,
        };
        element_data.remove(&entry_name)?;
        Some(())
    }

    pub fn merge_with_global_set(&mut self, global_name: String, entry_name: String, mut merge_with: Map<String, Value>) -> Option<()> {
        let element_data = match self
            .globals
            .get_mut(&global_name)
            .and_then(Value::as_object_mut)
            .and_then(|o| o.get_mut("data"))
            .and_then(Value::as_object_mut) {
            Some(d) => d,
            None => return None,
        };
        element_data.entry(&entry_name).or_insert(Value::Object(Map::new())).as_object_mut().unwrap().append(&mut merge_with);
        Some(())
    }

    /// edit_grid changes an element's position object's field
    pub fn edit_grid(&mut self, id: String, value_name: String, new_value: Value) -> Option<()> {
        match self.grid.entry(id).or_insert(Value::Object(Map::new())).as_object_mut() {
            None => return None,
            Some(o) => o.insert(value_name, new_value),
        };

        Some(())
    }

    /// merge_grid merges an existing element's position object with another object
    pub fn merge_grid(&mut self, id: String, mut merge_object: Map<String, Value>) -> Option<()> {
        match self.grid.entry(id).or_insert(Value::Object(Map::new())).as_object_mut() {
            None => return None,
            Some(o) => o.append(&mut merge_object)
        };
        Some(())
    }

    /// edit_element changes an element's data object's field
    pub fn edit_element(&mut self, id: String, value_name: String, new_value: Value) -> Option<()> {
        match self.elements.entry(id).or_insert(Value::Object(Map::new())).as_object_mut() {
            None => return None,
            Some(o) => o.insert(value_name, new_value),
        };
        Some(())
    }

    /// merge_element merges an existing element's data object with another object
    pub fn merge_element(&mut self, id: &String, mut merge_object: Map<String, Value>) -> Option<()> {
        match self.elements.entry(id).or_insert(Value::Object(Map::new())).as_object_mut() {
            None => return None,
            Some(o) => o.append(&mut merge_object),
        };

        Some(())
    }

    /// get_element_data takes an id of an element, and returns it's data object's mutable reference
    /// if it has data field, but it's not an object, then None is returned
    fn get_element_data<'a>(&'a mut self, id: String) -> Option<&'a mut Map<String, Value>> {
        let get_data = |v : &'a mut Map<String, Value>| {
            v.get_mut("data").and_then(Value::as_object_mut)
        };

        self.elements.get_mut(&id).and_then(Value::as_object_mut).and_then(get_data)
    }

    /// *_set method family works with element-associated data objects.
    pub fn add_to_set(&mut self, id: String, name: &String, value: &Value) -> Option<()> {
        let element_data = self.get_element_data(id)?;
        element_data.entry(name).or_insert(value.clone());

        Some(())
    }

    pub fn remove_from_set(&mut self, id: String, name: &String) -> Option<()> {
        let data = self.get_element_data(id)?;
        data.remove(name)?;

        Some(())
    }

    pub fn merge_with_set_item<'a>(&'a mut self, id: String, item_name: &String, merge_object: &Map<String, Value>) -> Option<()> {
        let get_item = |v : &'a mut Map<String, Value>| {
            v.get_mut(item_name).and_then(Value::as_object_mut)
        };

        let item_data = self.get_element_data(id).and_then(get_item)?;
        item_data.append(&mut merge_object.clone());

        Some(())
    }

    /// removes data connected to an id from CharacterData
    pub fn remove_by_id(&mut self, id: &String) -> Option<()> {
        self.elements.remove(id);
        self.grid.remove(id);
        Some(())
    }

    /// Checks if the provided id is in the grid.
    pub fn check_id(&self, id: &String) -> bool {
        !self.grid.contains_key(id)
    }

    pub fn get_grid(&self) -> Map<String, Value> {
        self.grid.clone()
    }

    /// sets a value from character data based on it's path. Can only change not-object values
    pub fn index_set(&mut self, change: Map<String, Value>) -> Option<()> {
        let path = if let Some(p) = change.get("path").and_then(Value::as_array) {
            p.iter().map(|v| v.as_str())
        } else {
            return None;
        };
        let new_value = match change.get("new_value") {
            Some(v) => v.clone(),
            None => return None,
        };
        let mut path = path.map(|v| v.unwrap());

        let mut current_object : &mut Map<String, Value>;
        match path.next() {
            Some("variables") => current_object = &mut self.variables,
            Some("globals") => current_object = &mut self.globals,
            Some("elements") => current_object = &mut self.elements,
            Some("grid") => current_object = &mut self.grid,
            None | Some(_) => return None,
        }

        for key in path {
            if current_object.contains_key(key) {
                let v = current_object.get_mut(key).unwrap();
                if v.is_object() {
                    current_object = v.as_object_mut().unwrap();
                    continue;
                } else {
                    *v = new_value;
                    break;
                }
            }
            else { // can possibly produce unwanted behaviour if middle of the path was erroneous
                current_object.insert(key.to_string(), new_value);
                break;
            }
        }

        Some(())
    }

    /// gets a variable from globals/variables/{variable_name}
    /// if the variable is an expression, tries to parse it
    /// returns Err if the value cannot be found, or it is not a String or a Number, or it can't be parsed
    /// raw values can be accessed directly by calling CharacterData.globals?.variables?.{variable_name}
    pub fn get_variable(&self, variable_name: &str, recursion_depth: Option<usize>) -> Result<Value, String> {
        let val = match self.variables.get(variable_name) {
            None => return Err(format!("variable {variable_name} not found")),
            Some(v) => v,
        };

        if recursion_depth.is_some_and(|n| n > 100) {
            return Err(format!("recursion depth {} achieved, aborting", recursion_depth.unwrap()));
        }

        match val {
            Value::Number(_) => return Ok(val.clone()),
            Value::String(s) => {
                if !s.starts_with('=') { // it is not a formula
                    return Ok(val.clone());
                }
                if s.starts_with("\\=") { // it is not a formula, but a string that is supposed to start with =
                    return Ok(Value::String(s.strip_prefix('\\').unwrap().to_string()))
                }
                return self.parse_formula(s, recursion_depth.unwrap_or(0));
            }
            _ => {},
        }
        Err("variable type not supported".to_string())
    }

    fn parse_formula(&self, s: &str, recursion_depth: usize) -> Result<Value, String> {
        if let Some(subs) = s.strip_prefix("=text:") {
            return self._parse_text(subs, recursion_depth);
        }
        Ok(Value::Number(Number::from(self.parse_numeric_token(s.strip_prefix('=').unwrap(), -1, recursion_depth)?)))
    }

    fn _parse_text(&self, _s: &str, _recursion_depth: usize) -> Result<Value, String> {
        
        Err(format!("todo!"))
    }

    fn parse_numeric_token(&self, token: &str, previous_op: i8, recursion_depth: usize) -> Result<i64, String> {
        if recursion_depth > 10 {
            return Err(format!("recursive variables not supported"));
        }
        let operation_order = ['r', '-', '+', '/', '*'];
        let current_op = match operation_order.get((previous_op + 1) as usize) {
            Some(op) => op,
            None => return Err(format!("couldn't parse a token as a numeric: {token}")),
        };
        if *current_op == 'r' {
            return self.parse_numeric_token(token, 0, recursion_depth);
        }
        let mut mapped = Vec::<i64>::new();
        for subtoken in token.split(*current_op) {
            match *current_op {
                '-' => {
                    let num = self.parse_numeric_token(subtoken, 1, recursion_depth)?;
                    mapped.push(num);
                },
                '+' => {
                    let num = self.parse_numeric_token(subtoken, 2, recursion_depth)?;
                    mapped.push(num);
                },
                '/' => {
                    let num = self.parse_numeric_token(subtoken, 3, recursion_depth)?;
                    mapped.push(num);
                },
                '*' => { // at this point each token is either a number, or a variable
                    let num = match subtoken.parse::<i64>() {
                        Ok(n) => n,
                        Err(_e) => {
                            if !subtoken.starts_with('{') || !subtoken.ends_with('}') || !subtoken.contains(':') {
                                return Err(format!("couldn't parse a token as a numeric: {token}"))
                            } else {
                                let c : Vec<_> = subtoken
                                    .strip_prefix('{').unwrap()
                                    .strip_suffix('}').unwrap()
                                    .split(":")
                                    .collect();
                                match self.get_global_variable(
                                    c[0],
                                    c[1],
                                    recursion_depth + 1)? {
                                        Value::Number(n) => n.as_i64().ok_or("".to_string()),
                                        Value::String(s) => s.parse::<i64>().map_err(|e| e.to_string()),
                                        Value::Bool(b) => Ok(if b {1} else {0}),
                                        _ => return Err(format!("couldn't parse a token as a numeric: {token}")),
                                }?
                            }
                        }
                    };
                    mapped.push(num);
                },
                _ => return Err(format!("???")),
            }
        };
        mapped.into_iter().reduce(|acc, e| match current_op {
            '+' => acc + e,
            '-' => acc - e,
            '*' => acc * e,
            '/' => acc / e,
            _ => acc,
        }).ok_or(format!("couldn't parse a token as a numeric: {token}"))
    }

    fn get_global_variable(&self, code: &str, id: &str, recursion_depth: usize) -> Result<Value, String> {
        match code {
            "prof" => {
                match self.globals.get("proficiencies")
                        .and_then(Value::as_object)
                        .and_then(|profs| profs.get(id)) {
                    None => return Ok(Value::Bool(false)),
                    Some(v) => return Ok(v.clone())
                }
            }
            "prof_mod" => {
                match self.globals.get("proficiencyModifier") {
                    None => return Ok(Value::Number(Number::from(0))),
                    Some(v) => return Ok(v.clone())
                }
            }
            "stat" => {
                match self.globals.get("stats")
                        .and_then(Value::as_object)
                        .and_then(|stats| stats.get(id)) {
                    None => return Ok(Value::Number(Number::from(0))),
                    Some(v) => return Ok(v.clone())
                }
            }
            "stat_cap" => {
                match self.globals.get("stats")
                        .and_then(Value::as_object)
                        .and_then(|stats| stats.get(id))
                        .and_then(Value::as_number)
                        .and_then(Number::as_i64) {
                    None => return Ok(Value::Number(Number::from(0))),
                    Some(mut n) => {
                        if n < 10 {
                            n = (n - 11) / 2
                        } else {
                            n = (n - 10) / 2
                        }
                        return Ok(Value::Number(Number::from(std::cmp::min(n, 2))));
                    }
                }
            }
            "stat_mod" => {
                match self.globals.get("stats")
                        .and_then(Value::as_object)
                        .and_then(|stats| stats.get(id))
                        .and_then(Value::as_number)
                        .and_then(Number::as_i64) {
                    None => return Ok(Value::Number(Number::from(0))),
                    Some(mut n) => {
                        if n < 10 {
                            n = (n - 11) / 2
                        } else {
                            n = (n - 10) / 2
                        }
                        return Ok(Value::Number(Number::from(n)));
                    }
                }
            }
            "var" => {
                return self.get_variable(id, Some(recursion_depth))
            }
            _ => {},
        }
        Err(format!{"provided global variable doesn't exist: {{{code}:{id}}}"})
    }

    pub fn get_variables(&self) -> Map<String, Value> {
        let mut processed = Map::new();
        for key in self.variables.keys() {
            match self.get_variable(key, None) {
                Ok(v) => processed.insert(key.clone(), v),
                Err(e) => processed.insert(key.clone(), Value::String(e)),
            };
        }
        processed
    }
}

impl Into<Value> for CharacterData {
    fn into(self) -> Value {
        let mut as_map = Map::new();
        as_map.insert("variables".to_string(), Value::Object(self.variables.clone()));
        as_map.insert("globals".to_string(), Value::Object(self.globals.clone()));
        as_map.insert("grid".to_string(), Value::Object(self.grid.clone()));
        as_map.insert("elements".to_string(), Value::Object(self.elements.clone()));
        Value::Object(as_map)
    }
}

impl From<Value> for CharacterData {
    fn from(value: Value) -> Self {
        let mut empty_data = CharacterData::generate_empty();
        match value.get("globals").and_then(Value::as_object) {
            Some(v) => empty_data.globals = v.clone(),
            _ => {},
        };
        match value.get("grid").and_then(Value::as_object) {
            Some(v) => empty_data.grid = v.clone(),
            _ => {},
        };
        match value.get("elements").and_then(Value::as_object) {
            Some(v) => empty_data.elements = v.clone(),
            _ => {},
        };
        match value.get("variables").and_then(Value::as_object) {
            Some(v) => empty_data.variables = v.clone(),
            _ => {},
        };
        empty_data
    }
}