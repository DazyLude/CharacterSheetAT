use tauri::AppHandle;

pub fn builder(app_handle: AppHandle) -> Result<(), tauri::Error> {
    std::thread::spawn(
        move || {
            let _editor_window = tauri::WindowBuilder::new(
                    &app_handle,
                    "add_element",
                    tauri::WindowUrl::App("add_element".into())
                )
                .title("add element")
                .fullscreen(false)
                .resizable(false)
                .inner_size(522., 253.)
                .build()?;
            Ok(())
        }
    ).join().expect("panic in the AddElement thread")
}