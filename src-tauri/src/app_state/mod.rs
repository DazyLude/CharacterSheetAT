//! Non window-specific states should be defined here
use std::path::PathBuf;
use tauri::{ AppHandle, Manager };

use crate::{
    disk_interactions::load_json_from_disk,
    windows::EditorStateSync
};

mod loaded_shortcuts;
mod element_ghost;
mod config;
mod catalogues;

pub use self::element_ghost::*;
pub use self::loaded_shortcuts::*;
pub use self::config::*;
pub use self::catalogues::*;

pub fn manage_states(app_handle: &AppHandle) {
    let open_config = ConfigState::open(app_handle);
    app_handle.manage::<LoadedShortcuts>(open_config.load_shortcuts(app_handle));
    let catalogue = CatalogueState::new();
    for new_catalogue in open_config.load_catalogues(app_handle) {
        catalogue.load_catalogue(new_catalogue);
    }
    app_handle.manage::<CatalogueState>(catalogue);
    app_handle.manage::<ConfigState>(open_config);
    app_handle.manage::<ElementGhost>(ElementGhost::new());
}

pub fn app_state_to_recovery_string(app_handle: &AppHandle) -> String {
    let app_state = app_handle.state::<EditorStateSync>();
    let open_file_path: PathBuf = app_state.get_path();
    let path_str = open_file_path.as_os_str();
    let data = path_str.to_string_lossy();

    data.to_string()
}

pub fn load_app_state_from_recovery_string(app_handle: &AppHandle, data: &String) {
    let path : PathBuf = data.into();
    let v = match load_json_from_disk(&path) {
        Ok(d) => d,
        Err(_) => return,
    };

    app_handle.state::<EditorStateSync>().change_associated_file(&app_handle, path, v.into());
}