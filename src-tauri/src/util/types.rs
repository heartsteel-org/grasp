use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct Config {
    pub league_path: String,
}

#[derive(Clone, Serialize)]
pub struct DownloadStatus {
    pub message: String,
    pub percent: Option<f32>,
    pub speed_mb_s: Option<f32>,
    pub downloaded_mb: Option<f32>,
    pub total_mb: Option<f32>,
}