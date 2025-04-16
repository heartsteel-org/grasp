use std::{
    fs::{self, File},
    io::{copy, Read, Write},
    path::PathBuf,
    thread,
    env,
    time::Instant,
};

use tauri::{AppHandle, Emitter};
use reqwest::blocking::Client;
use zip::ZipArchive;
use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize)]
struct Config {
    league_path: String,
}

#[derive(Clone, serde::Serialize)]
struct DownloadStatus {
    message: String,
    percent: Option<f32>,
    speed_mb_s: Option<f32>,
    downloaded_mb: Option<f32>,
    total_mb: Option<f32>,
}

fn emit_status(app: &AppHandle, status: DownloadStatus) {
    app.emit("download_status", status).ok();
}

#[tauri::command]
pub fn setup(app: AppHandle) {
    thread::spawn(move || {
        emit_status(&app, DownloadStatus {
            message: "Checking config...".into(),
            percent: None,
            speed_mb_s: None,
            downloaded_mb: None,
            total_mb: None,
        });

        let appdata = match env::var("APPDATA") {
            Ok(v) => v,
            Err(e) => {
                emit_status(&app, DownloadStatus {
                    message: format!("APPDATA error: {}", e),
                    percent: None,
                    speed_mb_s: None,
                    downloaded_mb: None,
                    total_mb: None,
                });
                return;
            }
        };

        let grasp_path = PathBuf::from(&appdata).join("grasp");
        let config_path = grasp_path.join("config.json");

        let league_path = if config_path.exists() {
            match fs::read_to_string(&config_path) {
                Ok(contents) => {
                    match serde_json::from_str::<Config>(&contents) {
                        Ok(config) => {
                            emit_status(&app, DownloadStatus {
                                message: "League path loaded from config".into(),
                                percent: None,
                                speed_mb_s: None,
                                downloaded_mb: None,
                                total_mb: None,
                            });
                            config.league_path
                        }
                        Err(e) => {
                            emit_status(&app, DownloadStatus {
                                message: format!("Config parse error: {}", e),
                                percent: None,
                                speed_mb_s: None,
                                downloaded_mb: None,
                                total_mb: None,
                            });
                            return;
                        }
                    }
                }
                Err(e) => {
                    emit_status(&app, DownloadStatus {
                        message: format!("Config read error: {}", e),
                        percent: None,
                        speed_mb_s: None,
                        downloaded_mb: None,
                        total_mb: None,
                    });
                    return;
                }
            }
        } else {
            #[cfg(target_os = "windows")]
            {
                let possible_dirs = vec![
                    "C:\\Riot Games\\League of Legends",
                    "D:\\Riot Games\\League of Legends", 
                    "E:\\Riot Games\\League of Legends",
                ];

                let mut found = None;
                for dir in possible_dirs {
                    if PathBuf::from(dir).is_dir() {
                        found = Some(dir.to_string());
                        break;
                    }
                }

                match found {
                    Some(path) => {
                        fs::create_dir_all(&grasp_path).ok();
                        let config = Config { league_path: path.clone() };
                        if let Ok(json) = serde_json::to_string_pretty(&config) {
                            fs::write(&config_path, json).ok();
                        }
                        path
                    }
                    None => {
                        emit_status(&app, DownloadStatus {
                            message: "League of Legends not found".into(),
                            percent: None,
                            speed_mb_s: None,
                            downloaded_mb: None,
                            total_mb: None,
                        });
                        return;
                    }
                }
            }

            #[cfg(not(target_os = "windows"))]
            {
                emit_status(&app, DownloadStatus {
                    message: "Only supported on Windows".into(),
                    percent: None,
                    speed_mb_s: None,
                    downloaded_mb: None,
                    total_mb: None,
                });
                return;
            }
        };

        let files_to_download = vec![
            (
                "https://github.com/LeagueToolkit/cslol-manager/releases/download/2024-10-27-401067d-prerelease/cslol-manager-windows.zip",
                "injector.zip",
                "skin injector"
            ),
            (
                "https://github.com/darkseal-org/lol-skins-developer/archive/refs/heads/main.zip",
                "skins.zip",
                "skin repository"
            ),
        ];

        fs::create_dir_all(&grasp_path).ok();
        let client = Client::new();

        for (url, zip_name, extract_folder) in files_to_download {
            let out_path = grasp_path.join(zip_name);
            let extract_path = grasp_path.join(extract_folder);

            if extract_path.exists() {
                emit_status(&app, DownloadStatus {
                    message: format!("{} already downloaded", extract_folder),
                    percent: None,
                    speed_mb_s: None,
                    downloaded_mb: None,
                    total_mb: None,
                });
                continue;
            }

            let mut response = match client.get(url).send() {
                Ok(r) => r,
                Err(e) => {
                    emit_status(&app, DownloadStatus {
                        message: format!("Download error: {}", e),
                        percent: None,
                        speed_mb_s: None,
                        downloaded_mb: None,
                        total_mb: None,
                    });
                    return;
                }
            };

            let total_size_opt = response.content_length();

            let mut out_file = File::create(&out_path).unwrap();
            let mut downloaded: u64 = 0;
            let mut buffer = [0; 8192];
            let start = Instant::now();

            loop {
                let n = match response.read(&mut buffer) {
                    Ok(0) => break,
                    Ok(n) => n,
                    Err(_) => break,
                };
                out_file.write_all(&buffer[..n]).unwrap();
                downloaded += n as u64;

                let elapsed = start.elapsed().as_secs_f32();
                let mbps = (downloaded as f32 / 1_000_000.0) / elapsed;
                let percent = total_size_opt.map(|t| (downloaded as f32 / t as f32) * 100.0);
                let total_mb = total_size_opt.map(|t| t as f32 / 1_000_000.0);

                emit_status(&app, DownloadStatus {
                    message: format!("Downloading {}...", extract_folder),
                    percent,
                    speed_mb_s: Some(mbps),
                    downloaded_mb: Some(downloaded as f32 / 1_000_000.0),
                    total_mb,
                });
            }

            emit_status(&app, DownloadStatus {
                message: format!("Unzipping {}...", extract_folder),
                percent: None,
                speed_mb_s: None,
                downloaded_mb: None,
                total_mb: None,
            });

            let file = File::open(&out_path).unwrap();
            let mut archive = ZipArchive::new(file).unwrap();

            for i in 0..archive.len() {
                let mut file = archive.by_index(i).unwrap();
                let path = extract_path.join(file.mangled_name().components().skip(1).collect::<PathBuf>());

                if file.name().ends_with('/') {
                    fs::create_dir_all(&path).ok();
                } else {
                    if let Some(p) = path.parent() {
                        fs::create_dir_all(p).ok();
                    }
                    let mut outfile = File::create(&path).unwrap();
                    copy(&mut file, &mut outfile).ok();
                }
            }

            let _ = fs::remove_file(&out_path);

            emit_status(&app, DownloadStatus {
                message: format!("{} extracted successfully", extract_folder),
                percent: None,
                speed_mb_s: None,
                downloaded_mb: None,
                total_mb: None,
            });
        }

        // ✅ Write config.ini inside the "skin injector" directory
        let injector_path = grasp_path.join("skin injector");
        let config_ini_path = injector_path.join("config.ini");

        let config_ini_contents = format!(
            "[General]
ignorebad=false
themeAccentColor=1
lastZipDirectory=@Variant(\\0\\0\\0\\x11\\xff\\xff\\xff\\xff)
themePrimaryColor=4
windowWidth=640
blacklist=true
suppressInstallConflicts=false
enableAutoRun=false
enableSystray=false
themeDarkMode=true
leaguePath={}/Game
windowHeight=640
verbosePatcher=false
detectGamePath=true
windowMaximised=false
enableUpdates=0
removeUnknownNames=true
lastUpdateUTCMinutes=29039901
", league_path);

        if let Err(e) = fs::write(&config_ini_path, config_ini_contents) {
            emit_status(&app, DownloadStatus {
                message: format!("Failed to write config.ini: {}", e),
                percent: None,
                speed_mb_s: None,
                downloaded_mb: None,
                total_mb: None,
            });
        } else {
            emit_status(&app, DownloadStatus {
                message: "Config written successfully".into(),
                percent: None,
                speed_mb_s: None,
                downloaded_mb: None,
                total_mb: None,
            });
        }

        emit_status(&app, DownloadStatus {
            message: "Done".into(),
            percent: None,
            speed_mb_s: None,
            downloaded_mb: None,
            total_mb: None,
        });
    });
}
