use std::{
    env,
    fs,
    path::PathBuf,
    process::{Command, Stdio},
    ffi::OsStr,
    thread,
};

use serde::Deserialize;
use std::os::windows::process::CommandExt;
use tauri::{AppHandle, Emitter};
use sysinfo::System;

#[derive(Deserialize, Debug)]
pub struct Config {
    league_path: String,
}

const CREATE_NO_WINDOW: u32 = 0x08000000;

#[tauri::command]
pub fn load_default_skin(app: AppHandle, skin_id: u32, champion_id: String) {
    thread::spawn(move || {
        if let Err(err) = run_skin_loading_logic(app.clone(), skin_id, champion_id) {
            app.emit("load_status", format!("Error: {}", err)).ok();
        }
    });
}

fn run_skin_loading_logic(app: AppHandle, skin_id: u32, champion_id: String) -> Result<(), String> {
    app.emit("load_status", "Loading skin...").ok();

    let appdata = env::var("APPDATA").map_err(|e| format!("APPDATA not found: {}", e))?;
    let grasp_dir = PathBuf::from(&appdata).join("grasp");
    let config_path = grasp_dir.join("config.json");

    let config_data = fs::read_to_string(&config_path)
        .map_err(|e| format!("Failed to read config.json: {}", e))?;

    let config: Config = serde_json::from_str(&config_data)
        .map_err(|e| format!("Invalid config.json: {}", e))?;

    let game_path = PathBuf::from(&config.league_path).join("Game");
    let skin_path = grasp_dir.join("skin repository").join(&champion_id).join(format!("{skin_id}.fantome"));

    if !skin_path.exists() {
        return Err(format!("Skin file not found: {}", skin_path.display()));
    }

    if !game_path.exists() {
        return Err(format!("Game path does not exist: {}", game_path.display()));
    }

    let temp_dir = grasp_dir.join("temp");
    let skins_out = temp_dir.join("skins/skin");
    let overlay_out = temp_dir.join("overlay");

    let cslol_dir = grasp_dir.join("skin injector");
    let mod_tools = cslol_dir.join("cslol-tools").join("mod-tools.exe");
    let config_ini = cslol_dir.join("config.ini");

    if !mod_tools.exists() {
        return Err(format!("mod-tools.exe not found: {}", mod_tools.display()));
    }

    if !config_ini.exists() {
        return Err(format!("config.ini not found: {}", config_ini.display()));
    }

    if temp_dir.exists() {
        fs::remove_dir_all(&temp_dir).map_err(|e| format!("Failed to delete temp dir: {}", e))?;
    }

    fs::create_dir_all(&temp_dir)
        .map_err(|e| format!("Failed to create temp directory: {}", e))?;

    app.emit("load_status", "Checking for overlay...").ok();

    let mut sys = System::new_all();
    sys.refresh_all();

    for process in sys.processes_by_name(OsStr::new("mod-tools.exe")) {
        if process.kill() {
            app.emit("load_status", "Killed previous overlay").ok();
        } else {
            app.emit("load_status", "Failed to kill previous overlay").ok();
        }
    }

    app.emit("load_status", "Importing skin...").ok();

    let import_output = Command::new(&mod_tools)
        .current_dir(&cslol_dir)
        .creation_flags(CREATE_NO_WINDOW)
        .arg("import")
        .arg(&skin_path)
        .arg(&skins_out)
        .arg(format!("--game:{}", game_path.display()))
        .output()
        .map_err(|e| format!("Failed to start import command: {}", e))?;

    if !import_output.status.success() {
        return Err(format!(
            "Import command failed with exit code: {:?}",
            import_output.status.code()
        ));
    }

    app.emit("load_status", "Creating overlay...").ok();

    let mkoverlay_output = Command::new(&mod_tools)
        .current_dir(&cslol_dir)
        .creation_flags(CREATE_NO_WINDOW)
        .arg("mkoverlay")
        .arg(&temp_dir.join("skins"))
        .arg(&overlay_out)
        .arg(format!("--game:{}", game_path.display()))
        .arg("--mods:skin")
        .output()
        .map_err(|e| format!("Failed to start mkoverlay command: {}", e))?;

    if !mkoverlay_output.status.success() {
        return Err(format!(
            "mkoverlay failed with exit code: {:?}",
            mkoverlay_output.status.code()
        ));
    }

    app.emit("load_status", "Running overlay...").ok();

    Command::new(&mod_tools)
        .current_dir(&cslol_dir)
        .arg("runoverlay")
        .arg(&overlay_out)
        .arg(&config_ini)
        .arg(format!("--game:{}", game_path.display()))
        .creation_flags(CREATE_NO_WINDOW)
        .stdout(Stdio::inherit())
        .stderr(Stdio::inherit())
        .spawn()
        .map_err(|e| format!("Failed to start runoverlay: {}", e))?;

    app.emit("load_status", "Skin loaded successfully").ok();
    Ok(())
}
