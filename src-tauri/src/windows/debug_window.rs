use tauri::{AppHandle, WindowEvent};

use crate::ipc::emit_tauri_error;
use crate::funny_constants::APP_NAME;

use super::CSATWindow;

pub struct DebugWindow {}


impl CSATWindow for DebugWindow {
    const LABEL: &'static str = "debug_window";
    fn builder(app_handle: &AppHandle) {
        let handle = app_handle.clone();
        std::thread::spawn(
            move || {
                let w = match tauri::WindowBuilder::new(
                    &handle,
                    Self::LABEL,
                    tauri::WindowUrl::App("debug_window".into())
                )
                .title(&(APP_NAME.to_string() + " debug_window"))
                .fullscreen(false)
                .build()
                {
                    Ok(w) => w,
                    Err(e) => {
                        emit_tauri_error(&handle, e.to_string());
                        return;
                    },
                };
                let h = handle.clone();
                w.listen("debug_event", move |e| {debug_event(&h, e)});
            }
        );
    }

    fn run_event_handler(_app_handle: &AppHandle, event: WindowEvent) {
        match event {
            WindowEvent::Focused(true) => {
            }
            WindowEvent::CloseRequested { .. } => {
            }
            _ => {}
        }
    }
}

fn debug_event(_app_handle: &AppHandle, _event: tauri::Event) {
}