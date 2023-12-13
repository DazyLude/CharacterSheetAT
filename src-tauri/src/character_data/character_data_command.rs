use super::CharacterData;
use crate::{command::Command, ipc::ChangeJSON};
use serde_json::{Value, Map};


pub enum CharacterDataCommand {
    Simple(OrdinaryCommand),
    Stacked(StackedCommands),
}

pub struct OrdinaryCommand {
    old_data: CharacterData,
    forward_change: Box<ChangeJSON>,
}

pub struct StackedCommands {
    old_data: CharacterData,
    changes: Vec<ChangeJSON>,
}

impl CharacterDataCommand {
    pub fn from_change_json(old_data: CharacterData, forward_change: ChangeJSON) -> CharacterDataCommand {
        CharacterDataCommand::Simple(
            OrdinaryCommand{
                old_data,
                forward_change: Box::from(forward_change),
            }
        )
    }

    pub fn add_element(old_data: CharacterData, data: Option<Map<String, Value>>, id: String, placement: Map<String, Value>) -> CharacterDataCommand {
        let add_to_grid = ChangeJSON {
            value_type : "grid".to_string(),
            value_name: None,
            id: Some(id.clone()),
            new_value: None,
            merge_object: Some(placement),
        };
        match data {
            Some(d) => {
                let add_to_data = ChangeJSON {
                    value_type : "element".to_string(),
                    value_name: None,
                    id: Some(id),
                    new_value: None,
                    merge_object: Some(d),
                };
                return CharacterDataCommand::Stacked(
                    StackedCommands {
                        old_data,
                        changes: vec![add_to_grid, add_to_data]
                    }
                )
            },
            None => {
                return CharacterDataCommand::Simple(
                    OrdinaryCommand {
                        old_data,
                        forward_change: Box::from(add_to_grid),
                    }
                )
            }
        };
    }
}

impl Command<CharacterData> for CharacterDataCommand {
    fn execute(&self, apply_to: &mut CharacterData) -> Result<(), String>{
        match self {
            Self::Simple(command) => {
                let ChangeJSON { value_type, id, value_name, new_value, merge_object } = *command.forward_change.clone();
                let op: Option<()> = match (value_type.as_str(), id, value_name, new_value, merge_object) {
                    ("grid",        Some(i), None,    None,    Some(m)) => apply_to.merge_grid(i, m),
                    ("grid",        Some(i), Some(n), Some(v), None   ) => apply_to.edit_grid(i, n, v),
                    ("element",     Some(i), None,    None,    Some(m)) => apply_to.merge_element(&i, m),
                    ("element",     Some(i), Some(n), Some(v), None   ) => apply_to.edit_element(i, n, v),
                    ("global",      None,    Some(n), None,    Some(m)) => apply_to.merge_global(n, m),
                    ("global",      None,    Some(n), Some(v), None   ) => apply_to.edit_global(n, v),
                    ("element-set", Some(i), Some(n), None,    Some(m)) => apply_to.merge_with_set_item(i, &n, &m),
                    ("element-set", Some(i), Some(n), Some(v), None   ) => apply_to.add_to_set(i, &n, &v),
                    ("remove",      Some(i), None   , None,    None   ) => apply_to.remove_by_id(&i),
                    ("remove-set",  Some(i), Some(n), None,    None   ) => apply_to.remove_from_set(i, &n),
                    ("any-set", _, _, _, Some(c)) => apply_to.index_set(c),
                    _ => None,
                };
                match op {
                    None => Err(format!("couldn't perform change {:?}", command.forward_change)),
                    _ => Ok(())
                }
            }, // Self::Simple
            Self::Stacked(commands) => {
                let old_data = &commands.old_data;
                for change in commands.changes.clone().into_iter() {
                    match Self::from_change_json(old_data.clone(), change).execute(apply_to) {
                        Err(e) => return Err(e),
                        _ => {},
                    }
                }
                Ok(())
            }, // Self::Stacked
        }

    }
    fn undo(&self, apply_to: &mut CharacterData) {
        match self {
            Self::Simple(command) => {
                *apply_to = command.old_data.clone();
            }
            Self::Stacked(commands) => {
                *apply_to = commands.old_data.clone();
            },
        }
    }
}