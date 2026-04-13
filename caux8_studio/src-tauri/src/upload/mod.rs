mod caux8;

use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RuntimeUploadPayload {
    pub adapter_id: String,
    pub question: serde_json::Value,
    pub credentials: serde_json::Value,
}

#[derive(Debug, Serialize)]
pub struct RuntimeUploadResult {
    pub ok: bool,
    pub message: Option<String>,
    pub data: Option<serde_json::Value>,
}

#[tauri::command]
pub async fn upload_problem(payload: RuntimeUploadPayload) -> Result<RuntimeUploadResult, String> {
    match payload.adapter_id.as_str() {
        "caux8-http" => caux8::upload(payload).await,
        other => Err(format!("暂不支持的 adapterId: {other}")),
    }
}
