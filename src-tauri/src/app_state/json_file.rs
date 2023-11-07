use std::path::PathBuf;
use std::sync::Mutex;

use crate::{
    character_data::{CharacterData, CharacterDataCommand},
    command::CommandStack,
};

pub struct JSONFile {
    data: Mutex<CharacterData>,
    original: Mutex<CharacterData>,
    path: Mutex<PathBuf>,
    history: Mutex<CommandStack<CharacterDataCommand>>
}

impl JSONFile {
    pub fn new() -> JSONFile {
        let empty_path: PathBuf = "".into();
        JSONFile {
            // persistent data
            original: Mutex::from(CharacterData::generate_empty()),
            path: Mutex::from(empty_path),
            // session data
            data: Mutex::from(CharacterData::generate_empty()),
            history: Mutex::from(CommandStack::new()),
        }
    }

    pub fn get_data(&self) -> CharacterData {
        self.data.lock().unwrap().clone()
    }

    pub fn get_path(&self) -> PathBuf {
        self.path.lock().unwrap().clone()
    }

    pub fn set_path(&self, path: PathBuf) {
        *self.path.lock().unwrap() = path;
    }

    pub fn set_data(&self, data: CharacterData) {
        *self.data.lock().unwrap() = data;
    }

    pub fn change_data(&self, command: CharacterDataCommand) -> Result<(), String> {
        let mut data = self.data.lock().unwrap().clone();
        self.history.lock().unwrap().do_one(command, &mut data)?;
        *self.data.lock().unwrap() = data;
        Ok(())
    }

    pub fn go_back(&self) {
        let mut data = self.get_data();
        self.history.lock().unwrap().undo_one(&mut data);
        self.set_data(data);
    }

    pub fn go_forward(&self) {
        let mut data = self.get_data();
        self.history.lock().unwrap().redo_one(&mut data);
        self.set_data(data);
    }

    pub fn remove_not_saved_flag(&self) {
        *self.original.lock().unwrap() = self.get_data();
    }

    pub fn has_unsaved_chages(&self) -> bool {
        *self.original.lock().unwrap() != *self.data.lock().unwrap()
    }
}