// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::path::PathBuf;
use std::ffi::OsStr;

use tauri::api::dialog::confirm;
use tauri::{ Manager, State, AppHandle, RunEvent, WindowEvent };

use app::logger::log_tauri_error;
use app::menu::{ generate_app_menu, menu_handler, save_character_sheet };
use app::app_state::{change_character_data, JSONFile, app_state_to_recovery_string, load_app_state_from_recovery_string};
use app::disk_interactions::{load_startup_data, save_startup_data};
use app::ipc::{ChangeJSON, load_data, PayloadJSON};

const APP_NAME : &str = "CSAT";

fn main() {
    let run_handler = |app_handle: &AppHandle, event: RunEvent| {
        match event {
            tauri::RunEvent::Ready => {
                let r_s = match load_startup_data(&app_handle) {
                    Ok(s) => s,
                    Err(_) => return,
                };
                load_app_state_from_recovery_string(app_handle, &r_s);
            }
            tauri::RunEvent::WindowEvent { label, event, .. } => {
                match label.as_str() {
                    "editor" => {
                        let window_handle = app_handle.get_window("editor");
                        match event {
                            WindowEvent::CloseRequested { api, .. } => {
                                let window_handle_clone = window_handle.clone();
                                let app_handle_clone = app_handle.clone();
                                api.prevent_close();
                                if app_handle.state::<JSONFile>().has_unsaved_chages() {
                                    confirm(
                                        app_handle.get_window("editor").as_ref(),
                                        "discard changes",
                                        "You have unsaved changes.\nAre you sure you want to discard them?",
                                        move |answer| {
                                            if answer {
                                                let r_s = app_state_to_recovery_string(&app_handle_clone);
                                                let _ = save_startup_data(&app_handle_clone, &r_s);
                                                let _ = window_handle_clone.unwrap().close();
                                            }
                                        }
                                    );
                                }
                                else {
                                    let r_s = app_state_to_recovery_string(&app_handle);
                                    let _ = save_startup_data(&app_handle, &r_s);
                                    let _ = window_handle.unwrap().close();
                                }
                            }
                            _ => {}
                        }
                    }
                    _ => {},
                }
            }
            tauri::RunEvent::MainEventsCleared => {
                match app_handle.get_window("editor") {
                    Some(w) => {
                        let mut title_suffix = "".to_string();
                        title_suffix += app_handle.state::<JSONFile>().get_path().file_name().and_then(OsStr::to_str).unwrap_or("not_named");
                        if app_handle.state::<JSONFile>().has_unsaved_chages() {
                            title_suffix += "*";
                        }
                        let _ = w.set_title(&(APP_NAME.to_string() + " editor: " + &title_suffix));
                    }
                    None => {}
                }
            }
            _ => {}
        }
    };

    tauri::Builder::default()
        .setup(|app| {
            app.listen_global("error", log_tauri_error);
            Ok(())
        })
        .menu(generate_app_menu())
        .on_menu_event(menu_handler)
        .manage(JSONFile::new())
        .invoke_handler(tauri::generate_handler![change_data, request_data, request_path, make_path_relative, shortcut])
        .build(tauri::generate_context!())
        .expect("error when building tauri application")
        .run(run_handler);
}

#[tauri::command]
fn change_data(app_handle: AppHandle, file: State<JSONFile>, payload: ChangeJSON) -> Result<(), String> {
    let _ = change_character_data(&file, payload);
    load_data(&app_handle)
}

#[tauri::command]
fn request_data(app_state: State<JSONFile>) -> Result<PayloadJSON, String> {
    Ok(PayloadJSON {
        data: app_state.get_data().as_value(),
    })
}

#[tauri::command]
fn request_path(app_state: State<JSONFile>, path: String) -> Result<String, String> {
    let child_path : PathBuf = path.into();
    if child_path.is_absolute() {
        return Err(child_path.to_string_lossy().to_string());
    }
    let mut json_path : PathBuf = app_state.get_path();
    json_path.pop();
    Ok(json_path.join::<PathBuf>(child_path).to_string_lossy().to_string())
}

#[tauri::command]
fn make_path_relative(app_state: State<JSONFile>, path: String) -> Result<String, String> {
    let mut json_path : PathBuf = app_state.get_path();
    json_path.pop();
    let child_path : PathBuf = path.into();
    if !child_path.starts_with(&json_path) {
        return Err(child_path.to_string_lossy().to_string());
    }
    Ok(child_path.strip_prefix(&json_path).unwrap().to_string_lossy().to_string())
}

#[derive(serde::Deserialize)]
struct PressedKey {
    ctrl_key: bool,
    alt_key: bool,
    key_code: String,
}

impl<'a> PressedKey {
    pub fn decompose(&'a self) -> (bool, bool, &'a str) {
        (self.ctrl_key, self.alt_key, self.key_code.as_str())
    }
}

#[tauri::command]
fn shortcut(app_handle: AppHandle, payload: PressedKey) {
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
        _ => {}
    }
}