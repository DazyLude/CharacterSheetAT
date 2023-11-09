use tauri::{ AppHandle, CustomMenuItem, Menu, Submenu, Manager, WindowEvent, Window };
use tauri::api::dialog::confirm;
use crate::app_state::{ editor_state::EditorState, app_state_to_recovery_string };
use crate::disk_interactions::save_startup_data;
use crate::funny_constants::APP_NAME;
use std::ffi::OsStr;

pub fn builder(app_handle: AppHandle) -> Result<(), tauri::Error> {
    std::thread::spawn(
        move || {
            let _editor_window = tauri::WindowBuilder::new(
                    &app_handle,
                    "editor",
                    tauri::WindowUrl::App("editor".into())
                )
                .title("CSAT editor")
                .fullscreen(false)
                .resizable(true)
                .inner_size(950., 700.)
                .menu(generate_editor_menu())
                .build()?;
            Ok(())
        }
    ).join().expect("panic in the editor thread")
}

fn generate_editor_menu() -> Menu {
    let file_menu = Menu::new()
        .add_item(CustomMenuItem::new("new", "New"))
        .add_item(CustomMenuItem::new("save", "Save").accelerator("ctrl+S"))
        .add_item(CustomMenuItem::new("save as", "Save As"))
        .add_item(CustomMenuItem::new("open", "Open"));
    let file_submenu = Submenu::new("File", file_menu);

    let edit_menu = Menu::new()
        .add_item(CustomMenuItem::new("undo", "Undo").accelerator("ctrl+Z"))
        .add_item(CustomMenuItem::new("redo", "Redo").accelerator("ctrl+Y"))
        .add_item(CustomMenuItem::new("add_element", "Add Element").accelerator("ctrl+E"))
        .add_item(CustomMenuItem::new("remove_element", "Remove Element").accelerator("ctrl+D"));
    let edit_submenu = Submenu::new("Edit", edit_menu);

    let mode_menu = Menu::new()
        .add_item(CustomMenuItem::new("readonly_switch", "Switch Readonly Mode").accelerator("ctrl+1"))
        .add_item(CustomMenuItem::new("layout_switch", "Switch Layout Editing Mode").accelerator("ctrl+2"))
        .add_item(CustomMenuItem::new("element_switch", "Switch Element Editing Mode").accelerator("ctrl+3"));
    let mode_submenu = Submenu::new("Mode", mode_menu);

    Menu::new()
        .add_submenu(file_submenu)
        .add_submenu(edit_submenu)
        .add_submenu(mode_submenu)
}

pub fn run_event_handler(app_handle: &AppHandle, event: WindowEvent) {
    let window = match app_handle.get_window("editor") {
        Some(w) => w,
        None => return,
    };
    match event {
        WindowEvent::CloseRequested { api, .. } => {
            api.prevent_close();
            let close = move |h: &AppHandle, w: &Window| {
                let r_s = app_state_to_recovery_string(&h);
                let _ = save_startup_data(&h, &r_s);
                match h.get_window("add_element") {
                    Some(cw) => {let _ = cw.close();}
                    None => {}
                };
                match h.get_window("remove_element") {
                    Some(cw) => {let _ = cw.close();}
                    None => {}
                };
                let _ = w.close();
            };

            if app_handle.state::<EditorState>().has_unsaved_chages() {
                let window_clone = window.clone();
                let app_handle_clone = window.app_handle();
                confirm(
                    app_handle.get_window("editor").as_ref(),
                    "discard changes",
                    "You have unsaved changes.\nAre you sure you want to discard them?",
                    move |answer| {
                        if answer {
                            close(&app_handle_clone, &window_clone);
                        }
                    }
                );
            }
            else {
                close(app_handle, &window);
            };
        }
        _ => {}
    }
}

pub fn after_events_cleared(app_handle: &AppHandle, window_handle: &Window) {
    let mut title_suffix = "".to_string();
    title_suffix += app_handle.state::<EditorState>().get_path().file_name().and_then(OsStr::to_str).unwrap_or("not_named");
    if app_handle.state::<EditorState>().has_unsaved_chages() {
        title_suffix += "*";
    }
    let _ = window_handle.set_title(&(APP_NAME.to_string() + " editor: " + &title_suffix));
}