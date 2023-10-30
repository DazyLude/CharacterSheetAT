use tauri::AppHandle;

pub fn builder(app_handle: AppHandle) -> Result<(), tauri::Error> {
    std::thread::spawn(
        move || {
            let _editor_window = tauri::WindowBuilder::new(
                    &app_handle,
                    "remove_element",
                    tauri::WindowUrl::App("remove_element".into())
                )
                .title("remove element")
                .fullscreen(false)
                .resizable(false)
                .inner_size(522., 63.)
                .build()?;
            Ok(())
        }
    ).join().expect("panic in the RemoveElement thread")
}