use tauri::api::dialog::confirm;
use tauri::{AppHandle, CustomMenuItem, Manager, Menu, Submenu, Window, WindowEvent};

use std::ffi::OsStr;
use std::path::PathBuf;
use std::sync::Mutex;

use super::CSATWindow;
use crate::{
    app_state::{app_state_to_recovery_string, ConfigState},
    character_data::{CharacterData, CharacterDataCommand},
    command::CommandStack,
    disk_interactions::save_startup_data,
    funny_constants::APP_NAME,
    ipc::{emit_tauri_error, AppEvent},
};

pub struct EditorWindow {}

impl CSATWindow for EditorWindow {
    const LABEL: &'static str = "editor";

    fn builder(app_handle: &AppHandle) {
        let _ = app_handle.manage(EditorStateSync::new());
        let handle = app_handle.clone();
        std::thread::spawn(move || {
            let w = match tauri::WindowBuilder::new(
                &handle,
                Self::LABEL,
                tauri::WindowUrl::App("editor".into()),
            )
            .title(&(APP_NAME.to_string() + " editor"))
            .fullscreen(false)
            .resizable(true)
            .inner_size(950., 700.)
            .menu(EditorWindow::generate_editor_menu(&handle))
            .build()
            {
                Ok(w) => w,
                Err(e) => {
                    emit_tauri_error(&handle, e.to_string());
                    return;
                }
            };

            let h = handle.clone();
            w.listen("ghost_moved_by_add_element", move |_e| move_ghost(&h));
        });
    }

    fn run_event_handler(app_handle: &AppHandle, event: WindowEvent) {
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
                        Some(cw) => {
                            let _ = cw.close();
                        }
                        None => {}
                    };
                    match h.get_window("remove_element") {
                        Some(cw) => {
                            let _ = cw.close();
                        }
                        None => {}
                    };
                    let _ = w.close();
                };
                if app_handle.state::<EditorStateSync>().has_unsaved_chages() {
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
                        },
                    );
                } else {
                    close(app_handle, &window);
                };
            }
            _ => {}
        }
    }

    fn after_events_cleared(app_handle: &AppHandle, window_handle: &Window) {
        let mut title_suffix = "".to_string();
        title_suffix += app_handle
            .state::<EditorStateSync>()
            .get_path()
            .file_name()
            .and_then(OsStr::to_str)
            .unwrap_or("not_named");
        if app_handle.state::<EditorStateSync>().has_unsaved_chages() {
            title_suffix += "*";
        }
        let _ = window_handle.set_title(&(APP_NAME.to_string() + " editor: " + &title_suffix));
    }
}

impl EditorWindow {
    fn generate_editor_menu(app_handle: &AppHandle) -> Menu {
        let shortcuts = app_handle.state::<ConfigState>();
        let make_label = |text: &str, act: AppEvent| -> String {
            match shortcuts.get_accel(act).as_str() {
                "unknown" => text.to_string(),
                smth_else => text.to_string() + "\t" + smth_else,
            }
        };
        let file_menu = Menu::new()
            .add_item(CustomMenuItem::new(
                "new",
                make_label("New", AppEvent::FileNew),
            ))
            .add_item(CustomMenuItem::new(
                "save",
                make_label("Save", AppEvent::FileSave),
            ))
            .add_item(CustomMenuItem::new(
                "save as",
                make_label("Save As", AppEvent::FileSaveAs),
            ))
            .add_item(CustomMenuItem::new(
                "open",
                make_label("Open", AppEvent::FileOpen),
            ));
        let file_submenu = Submenu::new("File", file_menu);

        let edit_menu = Menu::new()
            .add_item(CustomMenuItem::new(
                "undo",
                make_label("Undo", AppEvent::ActionUndo),
            ))
            .add_item(CustomMenuItem::new(
                "redo",
                make_label("Redo", AppEvent::ActionRedo),
            ))
            .add_item(CustomMenuItem::new(
                "add_element",
                make_label("Add Element", AppEvent::WindowAddElement),
            ));
        let edit_submenu = Submenu::new("Edit", edit_menu);

        let mode_menu = Menu::new()
            .add_item(CustomMenuItem::new(
                "readonly_switch",
                make_label("Switch Readonly Mode", AppEvent::ModReadOnly),
            ))
            .add_item(CustomMenuItem::new(
                "layout_switch",
                make_label("Switch Layout Editing Mode", AppEvent::ModGridEdit),
            ))
            .add_item(CustomMenuItem::new(
                "element_switch",
                make_label("Switch Element Editing Mode", AppEvent::ModElementEdit),
            ));
        let mode_submenu = Submenu::new("Mode", mode_menu);

        Menu::new()
            .add_submenu(file_submenu)
            .add_submenu(edit_submenu)
            .add_submenu(mode_submenu)
    }
}

fn tell_to_reload(handle: &AppHandle) {
    handle
        .emit_to("editor", "new_data", {})
        .unwrap_or_else(|error| emit_tauri_error(handle, error.to_string()));
    handle
        .emit_to("debug_window", "new_data", {})
        .unwrap_or_else(|error| emit_tauri_error(handle, error.to_string()));
}

fn move_ghost(handle: &AppHandle) {
    handle
        .emit_to("editor", "move_ghost", {})
        .unwrap_or_else(|error| emit_tauri_error(handle, error.to_string()));
}

pub struct EditorStateSync {
    state: Mutex<EditorState>,
}

impl EditorStateSync {
    pub fn new() -> Self {
        EditorStateSync {
            state: Mutex::from(EditorState::new()),
        }
    }

    pub fn change_associated_file(
        &self,
        handle: &AppHandle,
        path: PathBuf,
        data: serde_json::Value,
    ) {
        self.set_path(path);
        self.set_data(data.into(), handle);
        self.remove_not_saved_flag();
    }

    pub fn as_value(&self) -> serde_json::Value {
        self.get_data().into()
    }

    pub fn get_data(&self) -> CharacterData {
        self.state.lock().unwrap().history.data.clone()
    }

    pub fn get_path(&self) -> PathBuf {
        self.state.lock().unwrap().path.clone()
    }

    pub fn set_path(&self, path: PathBuf) {
        self.state.lock().unwrap().path = path;
    }

    pub fn set_data(&self, data: CharacterData, handle: &AppHandle) {
        self.state.lock().unwrap().history.data = data.clone();
        tell_to_reload(handle);
    }

    pub fn change_data(
        &self,
        command: CharacterDataCommand,
        handle: &AppHandle,
    ) -> Result<(), String> {
        let mut state = self.state.lock().unwrap();
        state.history.do_one(command)?;
        tell_to_reload(handle);
        Ok(())
    }

    pub fn go_back(&self, handle: &AppHandle) {
        let mut state = self.state.lock().unwrap();
        tell_to_reload(handle);
        state.history.undo_one();
    }

    pub fn go_forward(&self, handle: &AppHandle) {
        let mut state = self.state.lock().unwrap();
        tell_to_reload(handle);
        state.history.redo_one();
    }

    pub fn remove_not_saved_flag(&self) {
        let mut state = self.state.lock().unwrap();
        state.original = state.history.data.clone();
    }

    pub fn has_unsaved_chages(&self) -> bool {
        let state = self.state.lock().unwrap();
        state.original != state.history.data
    }
}

pub struct EditorState {
    // persistent data - directly tied to what's on the disk
    pub path: PathBuf,
    pub original: CharacterData,
    // session data - something that's just in-memory
    pub history: CommandStack<CharacterDataCommand, CharacterData>,
}

impl EditorState {
    pub fn new() -> EditorState {
        let empty_path: PathBuf = "".into();
        EditorState {
            original: CharacterData::generate_empty(),
            path: empty_path,
            history: CommandStack::with_initial(CharacterData::generate_empty()),
        }
    }
}
