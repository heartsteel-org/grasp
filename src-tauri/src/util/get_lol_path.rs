use std::{env, fs, path::PathBuf};
use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize)]
pub struct Config {
    pub league_path: String,
}

#[tauri::command]
pub async fn get_lol_path() -> Result<String, String> {
    let appdata = env::var("APPDATA").map_err(|e| e.to_string())?;
    let config_path = PathBuf::from(appdata).join("grasp").join("config.json");
    
    let config_str = fs::read_to_string(config_path)
        .map_err(|e| format!("Failed to read config: {}", e))?;
    
    let config: Config = serde_json::from_str(&config_str)
        .map_err(|e| format!("Failed to parse config: {}", e))?;
    
    Ok(config.league_path)
}
