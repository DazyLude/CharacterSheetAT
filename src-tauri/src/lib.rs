pub mod character_data;
pub mod ipc;
pub mod disk_interactions;
pub mod app_state;
pub mod menu;
pub mod command;

pub mod logger {
    pub fn log_tauri_error(event: tauri::Event) {
        match event.payload() {
            Some(payload) => println!("{}", payload),
            None => println!("error happened, somewhere, somehow"),
        }
    }
}
