use tauri::{ Manager, AppHandle, RunEvent, App, WindowMenuEvent };

use crate::app_state::{JSONFile, load_app_state_from_recovery_string, load_json_file};
use crate::character_data::CharacterData;
use crate::disk_interactions::{load_startup_data, open_character_sheet, save_character_sheet, save_as_character_sheet};
use crate::ipc::{ load_data, PressedKey };
use crate::windows;

pub fn menu_event_handler(event: WindowMenuEvent) {
    match event.menu_item_id() {
        "open" => {
            open_character_sheet(event.window().clone());
        }
        "save" => {
            let _ = save_character_sheet(event.window().app_handle().state::<JSONFile>());
        }
        "save as" => {
            save_as_character_sheet(event.window().clone());
        }
        "new" => {
            let app_handle = event.window().app_handle();
            let v = CharacterData::generate_empty();
            let p = "".into();
            load_json_file(&app_handle, v, p);
            let _ = load_data(&app_handle);
        }
        "undo" => {
            let app_handle = event.window().app_handle();
            app_handle.state::<JSONFile>().go_back();
            let _ = load_data(&app_handle);
        }
        "redo" => {
            let app_handle = event.window().app_handle();
            app_handle.state::<JSONFile>().go_forward();
            let _ = load_data(&app_handle);
        },
        "add_element" => {
            let app_handle = event.window().app_handle();
            let _ = match app_handle.get_window("add_element") {
                Some(w) => w.set_focus(),
                None => windows::add_element::builder(app_handle),
            };
        },
        "remove_element" => {
            let app_handle = event.window().app_handle();
            let _ = match app_handle.get_window("remove_element") {
                Some(w) => w.set_focus(),
                None => windows::remove_element::builder(app_handle),
            };
        },
        "readonly_switch" => {
            let app_handle = event.window().app_handle();
            crate::ipc::change_editor_context(&app_handle, "readOnly-switch".to_string());
        }
        "layout_switch" => {
            let app_handle = event.window().app_handle();
            crate::ipc::change_editor_context(&app_handle, "layoutEdit-switch".to_string());
        }
        "element_switch" => {
            let app_handle = event.window().app_handle();
            crate::ipc::change_editor_context(&app_handle, "elementEdit-switch".to_string());
        }
        e => println!("Got an unimplemented menu event with id: {:?}", e),
    }
}

pub fn run_event_handler(app_handle: &AppHandle, event: RunEvent) {
    match event {
        tauri::RunEvent::Ready => {
            let r_s = match load_startup_data(&app_handle) {
                Ok(s) => s,
                Err(_) => return,
            };
            load_app_state_from_recovery_string(app_handle, &r_s);
        }
        tauri::RunEvent::WindowEvent { label, event, .. } => windows::run_event_handler(app_handle, label, event),
        tauri::RunEvent::MainEventsCleared => {
            windows::after_events_cleared(app_handle);
        }
        _ => {}
    }
}

pub fn setup_app_event_listeners(app: &mut App) -> Result<(), Box<dyn std::error::Error>> {
    app.listen_global("error", log_tauri_error);
    Ok(())
}

pub fn shortcut_handler(app_handle: &AppHandle, payload: &PressedKey) {
    match payload.decompose() {
        (true, false, "KeyS") => {
            let _ = save_character_sheet(app_handle.state::<JSONFile>());
        },
        (true, false, "KeyZ") => {
            app_handle.state::<JSONFile>().go_back();
            let _ = load_data(&app_handle);
        },
        (true, false, "KeyY") => {
            app_handle.state::<JSONFile>().go_forward();
            let _ = load_data(&app_handle);
        },
        (true, false, "KeyE") => {
            let h = app_handle.clone();
            let _ = match app_handle.get_window("add_element") {
                Some(w) => {
                    let _ = w.set_focus();
                    w.show()
                }
                None => windows::add_element::builder(h),
            };
        }
        (true, false, "KeyD") => {
            let h = app_handle.clone();
            let _ = match app_handle.get_window("remove_element") {
                Some(w) => {
                    let _ = w.set_focus();
                    w.show()
                }
                None => windows::remove_element::builder(h),
            };
        }
        (true, false, "Digit1") => {
            crate::ipc::change_editor_context(app_handle, "readOnly-switch".to_string());
        }
        (true, false, "Digit2") => {
            crate::ipc::change_editor_context(app_handle, "layoutEdit-switch".to_string());
        }
        (true, false, "Digit3") => {
            crate::ipc::change_editor_context(app_handle, "elementEdit-switch".to_string());
        }
        _ => return,
    }
}

fn log_tauri_error(event: tauri::Event) {
    match event.payload() {
        Some(payload) => println!("{}", payload),
        None => println!("error happened, somewhere, somehow"),
    }
}