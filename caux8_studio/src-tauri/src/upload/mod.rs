mod caux8;

use serde::{Deserialize, Serialize};

use crate::runtime_error::RuntimeCommandError;

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
pub async fn upload_problem(
    payload: RuntimeUploadPayload,
) -> Result<RuntimeUploadResult, RuntimeCommandError> {
    match payload.adapter_id.as_str() {
        "caux8-http" => caux8::upload(payload).await,
        other => Err(RuntimeCommandError::new(
            "unsupported_adapter",
            format!("暂不支持的 adapterId: {other}"),
        )),
    }
}
