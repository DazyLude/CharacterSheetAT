use tauri::AppHandle;
use serde_json::Value;
use std::fs::File;
use std::io::{ BufReader, Read, Error, ErrorKind };
use std::path::PathBuf;

pub fn save_startup_data(app_handle: &AppHandle, data: &String) -> Result<(), Error> {
    let data_dir_path = match app_handle.path_resolver().app_data_dir() {
        Some(p) => p,
        None => return Err(Error::new(ErrorKind::Other, "app data directory not provided")),
    };
    let appdata_file_path = data_dir_path.join::<PathBuf>("startup.cfg".into());
    match std::fs::write(&appdata_file_path, &data.as_bytes()) {
        Err(e) => {
            match e.kind() {
                ErrorKind::NotFound => {
                    std::fs::create_dir(data_dir_path)?;
                    std::fs::write(&appdata_file_path, &data.as_bytes())?;
                    return Ok(());
                }
                _ => {},
            }
            Err(e)
        }
        a => a,
    }
}

pub fn load_startup_data(app_handle: &AppHandle) -> Result<String, Error> {
    let data_dir_path = match app_handle.path_resolver().app_data_dir() {
        Some(p) => p,
        None => return Err(Error::new(ErrorKind::Other, "app data directory not provided")),
    };
    let appdata_file_path = data_dir_path.join::<PathBuf>("startup.cfg".into());
    let file = File::open(appdata_file_path)?;
    let mut startup_data = String::new();
    BufReader::new(file).read_to_string(&mut startup_data)?;
    Ok(startup_data)
}

pub fn load_json_from_disk(path: &PathBuf) -> Result<Value, String> {
    let open_file = |path: &PathBuf| -> Result<File, String> {
        match File::open(path) {
            Ok(f) => Ok(f),
            Err(err) => Err("Failed to open provided file:\n\t".to_string() + &err.to_string()),
        }
    };
    let parse_from_reader = |file: File| -> Result<Value, String> {
        let reader = BufReader::new(file);
        match serde_json::from_reader(reader) {
            Ok(v) => Ok(v),
            Err(err) => Err("Failed to parse provided file:\n\t".to_string() + &err.to_string()),
        }
    };
    open_file(&path).and_then(parse_from_reader)
}
