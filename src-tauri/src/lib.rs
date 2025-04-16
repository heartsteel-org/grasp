mod util {
    pub mod get_lol_path;
    pub mod setup;
}

mod skins {
    pub mod load_default;
    pub mod load_custom;
}

pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            util::get_lol_path::get_lol_path,
            skins::load_default::load_default_skin,
            util::setup::setup,
        ])
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
