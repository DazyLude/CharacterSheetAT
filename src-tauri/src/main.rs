// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use app::character_data::CharacterData;
use app::ipc::{ChangeJSON, load_data, PayloadJSON};
use tauri::api::dialog::FileDialogBuilder;
use tauri::{ Manager, State, AppHandle, RunEvent, WindowMenuEvent };

use app::app_state::JSONFile;
use app::logger::log_tauri_error;
use app::disk_interactions::{load_json_from_disk, load_startup_data, save_startup_data};
use app::ipc::apply_change;
use app::menu::generate_app_menu;

fn main() {
    let window_menu_handler = |event: WindowMenuEvent| {
        match event.menu_item_id() {
            "open" => {
                open_character_sheet(event.window().clone());
            }
            "log" => {
                let handle = event.window().app_handle();
                let state = handle.state::<JSONFile>();
                println!("{:?}", *state.data.lock().unwrap());
            }
            "save" => {
                let _ = save_character_sheet(event.window().app_handle().state::<JSONFile>());
            }
            "save as" => {
                save_as_character_sheet(event.window().clone());
            }
            "new" => {
                let handle = event.window().app_handle();
                let state = handle.state::<JSONFile>();
                *state.data.lock().unwrap() = CharacterData::generate_empty();
                *state.path.lock().unwrap() = "".into();
                let _ = load_data(&handle);
            }
            e => println!("Got an unimplemented menu event with id: {:?}", e),
        }
    };

    let run_handler = |app_handle: &AppHandle, event: RunEvent| {
        match event {
            tauri::RunEvent::ExitRequested { .. }  => {
                save_startup_data(&app_handle);
            }
            tauri::RunEvent::Ready => {
                load_startup_data(&app_handle);
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
        .on_menu_event(window_menu_handler)
        .manage(JSONFile::new())
        .invoke_handler(tauri::generate_handler![change_data, request_data])
        .build(tauri::generate_context!())
        .expect("error when building tauri application")
        .run(run_handler);
}

fn open_character_sheet(window: tauri::Window) {
    FileDialogBuilder::new().pick_file(move |file_path| {
        let app_handle = window.app_handle();
        match file_path {
            Some(p) => load_json_from_disk(&app_handle, p),
            None => return, // path was not provided by the user, we can just exit
        };

        window.set_focus().unwrap();
    });
}

fn save_character_sheet(app_state: State<JSONFile>) -> Result<(), String> {
    let path = app_state.path.lock().unwrap().clone();
    let data = serde_json::to_string(&app_state.data.lock().unwrap().as_value()).unwrap();
    if path.to_str() == Some("") {return Ok(());}

    match std::fs::write(&path, &data) {
        Err(e) => return Err(e.to_string()),
        Ok(_) => return Ok(()),
    };
}

#[tauri::command]
fn change_data(app_handle: AppHandle, app_state: State<JSONFile>, payload: ChangeJSON) -> Result<(), String> {
    let mut data = app_state.data.lock().unwrap().clone();
    let _ = apply_change(payload, &mut data);
    *app_state.data.lock().unwrap() = data;
    load_data(&app_handle)
}

#[tauri::command]
fn request_data(app_state: State<JSONFile>) -> Result<PayloadJSON, String> {
    return Ok(PayloadJSON {
        data: app_state.data.lock().unwrap().as_value(),
    })
}

fn save_as_character_sheet(window: tauri::Window) {
    FileDialogBuilder::new().save_file(move |file_path| {
        let app = &window.app_handle();
        let data = app.state::<JSONFile>().data.lock().unwrap().as_value();
        let data = serde_json::to_string(&data).unwrap();
        match file_path {
            Some(p) => {
                match std::fs::write(&p, &data) {
                    Err(_e) => {},
                    Ok(_) => *app.state::<JSONFile>().path.lock().unwrap() = p,
                };
            },
            None => return, // path was not provided by the user, we can just exit
        };

        window.set_focus().unwrap();
    });
}