use reqwest::{header::COOKIE, Client};
use serde::{Deserialize, Serialize};

use crate::runtime_error::{truncate_detail, RuntimeCommandError};

const COURSE_VIEW_ENDPOINT: &str = "http://page.cau.edu.cn/course/view.php";

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ResolveCaux8SessionRequest {
    moodle_session: String,
    course_id: u64,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Caux8SessionInfo {
    course_id: u64,
    sesskey: String,
    login_info: Option<String>,
    sections: Vec<Caux8CourseSection>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Caux8CourseSection {
    id: String,
    section: u64,
    name: Option<String>,
}

#[tauri::command]
pub async fn resolve_caux8_session(
    request: ResolveCaux8SessionRequest,
) -> Result<Caux8SessionInfo, RuntimeCommandError> {
    if request.moodle_session.trim().is_empty() {
        return Err(RuntimeCommandError::new(
            "missing_moodle_session",
            "MoodleSession 不能为空",
        ));
    }

    let client = Client::builder().build().map_err(|err| {
        RuntimeCommandError::new("http_client_error", "创建 HTTP client 失败")
            .with_detail(err.to_string())
    })?;

    let response = client
        .get(COURSE_VIEW_ENDPOINT)
        .query(&[("id", request.course_id)])
        .header(
            COOKIE,
            format!("MoodleSession={}", request.moodle_session.trim()),
        )
        .send()
        .await
        .map_err(|err| {
            RuntimeCommandError::new("resolve_session_request_error", "请求课程页失败")
                .with_detail(err.to_string())
        })?;

    let status = response.status();
    let body = response.text().await.map_err(|err| {
        RuntimeCommandError::new("read_course_page_error", "读取课程页响应失败")
            .with_status(status.as_u16())
            .with_detail(err.to_string())
    })?;

    if !status.is_success() {
        return Err(
            RuntimeCommandError::new("course_page_response_error", "课程页响应状态异常")
                .with_status(status.as_u16())
                .with_detail(truncate_detail(body)),
        );
    }

    let sesskey = extract_sesskey(&body).ok_or_else(|| {
        RuntimeCommandError::new("missing_sesskey", "未从课程页解析到 sesskey")
            .with_status(status.as_u16())
            .with_detail(truncate_detail(body.clone()))
    })?;

    Ok(Caux8SessionInfo {
        course_id: request.course_id,
        sesskey,
        login_info: extract_login_info(&body),
        sections: extract_sections(&body),
    })
}

fn extract_sesskey(html: &str) -> Option<String> {
    let marker = "sesskey=";
    let start = html.find(marker)? + marker.len();
    let value = html[start..]
        .chars()
        .take_while(|ch| ch.is_ascii_alphanumeric())
        .collect::<String>();

    if value.is_empty() {
        None
    } else {
        Some(value)
    }
}

fn extract_login_info(html: &str) -> Option<String> {
    let div_start = find_tag_with_class(html, "div", "logininfo")?;
    let div_end = html[div_start..].find("</div>")? + div_start + "</div>".len();
    Some(normalize_text(&strip_tags(&html[div_start..div_end])))
}

fn extract_sections(html: &str) -> Vec<Caux8CourseSection> {
    let mut sections = Vec::new();
    let mut offset = 0;

    while let Some(relative_start) = html[offset..].find("id=\"section-") {
        let id_start = offset + relative_start + "id=\"".len();
        let id_end = match html[id_start..].find('"') {
            Some(relative_end) => id_start + relative_end,
            None => break,
        };
        let id = &html[id_start..id_end];
        let Some(section) = id.strip_prefix("section-").and_then(|raw| raw.parse().ok()) else {
            offset = id_end;
            continue;
        };

        let next_section_start = html[id_end..]
            .find("id=\"section-")
            .map(|relative| id_end + relative)
            .unwrap_or(html.len());
        let section_html = &html[id_end..next_section_start];
        let name = extract_section_name(section_html);

        sections.push(Caux8CourseSection {
            id: id.to_string(),
            section,
            name,
        });

        offset = next_section_start;
    }

    sections
}

fn extract_section_name(html: &str) -> Option<String> {
    let start = find_tag_with_class(html, "span", "sectionname")
        .or_else(|| find_tag_with_class(html, "h3", "sectionname"))
        .or_else(|| find_tag_with_class(html, "div", "sectionname"))?;
    let tag_end = html[start..].find('>')? + start + 1;
    let close_start = html[tag_end..]
        .find("</")
        .map(|relative| tag_end + relative)?;
    Some(normalize_text(&strip_tags(&html[tag_end..close_start])))
}

fn find_tag_with_class(html: &str, tag: &str, class_name: &str) -> Option<usize> {
    let marker = format!("<{tag}");
    let mut offset = 0;

    while let Some(relative_start) = html[offset..].find(&marker) {
        let start = offset + relative_start;
        let tag_end = html[start..].find('>').map(|relative| start + relative)?;
        let tag_head = &html[start..tag_end];
        if tag_head.contains("class=") && tag_head.contains(class_name) {
            return Some(start);
        }
        offset = tag_end;
    }

    None
}

fn strip_tags(input: &str) -> String {
    let mut output = String::new();
    let mut inside_tag = false;

    for ch in input.chars() {
        match ch {
            '<' => inside_tag = true,
            '>' => {
                inside_tag = false;
                output.push(' ');
            }
            _ if !inside_tag => output.push(ch),
            _ => {}
        }
    }

    output
}

fn normalize_text(input: &str) -> String {
    input.split_whitespace().collect::<Vec<_>>().join(" ")
}
