use serde::Serialize;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RuntimeCommandError {
    pub code: String,
    pub message: String,
    pub detail: Option<String>,
    pub status: Option<u16>,
}

impl RuntimeCommandError {
    pub fn new(code: impl Into<String>, message: impl Into<String>) -> Self {
        Self {
            code: code.into(),
            message: message.into(),
            detail: None,
            status: None,
        }
    }

    pub fn with_detail(mut self, detail: impl Into<String>) -> Self {
        self.detail = Some(detail.into());
        self
    }

    pub fn with_status(mut self, status: u16) -> Self {
        self.status = Some(status);
        self
    }
}

pub fn truncate_detail(value: String) -> String {
    const MAX_DETAIL_LEN: usize = 4000;
    if value.chars().count() <= MAX_DETAIL_LEN {
        return value;
    }

    format!(
        "{}...(truncated)",
        value.chars().take(MAX_DETAIL_LEN).collect::<String>()
    )
}
