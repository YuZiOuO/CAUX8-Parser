use reqwest::{
    header::{COOKIE, LOCATION},
    multipart::Form,
    redirect::Policy,
    Client,
};
use serde::{Deserialize, Serialize};
use url::Url;

use super::{RuntimeUploadPayload, RuntimeUploadResult};

const CAU_BASE_URL: &str = "http://page.cau.edu.cn";
const CREATE_QUESTION_ENDPOINT: &str = "http://page.cau.edu.cn/course/modedit.php";
const CREATE_TESTCASE_ENDPOINT: &str =
    "http://page.cau.edu.cn/mod/assignment/type/onlinejudge/testcase.php";

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct Caux8Credentials {
    moodle_session: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct RequiredQuestion {
    basic_info: BasicInfo,
    description: Description,
    test_cases: Vec<TestCase>,
    #[serde(default)]
    online_judge_settings: OnlineJudgeSettingsInput,
    #[serde(default)]
    submission_settings: SubmissionSettingsInput,
    #[serde(default)]
    grade_settings: GradeSettingsInput,
    redirect_target: Option<String>,
}

#[derive(Debug, Deserialize)]
struct BasicInfo {
    course: u64,
    section: u64,
    sesskey: String,
    name: String,
    #[serde(rename = "mform_showadvanced_last")]
    mform_showadvanced_last: u8,
}

#[derive(Debug, Deserialize)]
struct Description {
    text: String,
}

#[derive(Debug, Deserialize)]
struct TestCase {
    caseid: i64,
    input: String,
    output: String,
    feedback: String,
    subgrade: String,
}

#[derive(Debug, Default, Deserialize)]
struct OnlineJudgeSettingsInput {
    language: Option<String>,
    ratiope: Option<f64>,
    cpulimit: Option<u8>,
    memlimit: Option<u64>,
    compileonly: Option<u8>,
    preamble: Option<String>,
    postamble: Option<String>,
    forbiddenwords: Option<String>,
}

#[derive(Debug, Default, Deserialize)]
struct SubmissionSettingsInput {
    preventlate: Option<u8>,
    maxbytes: Option<u64>,
    resubmit: Option<u8>,
    var1: Option<u8>,
    var2: Option<u8>,
    var3: Option<u8>,
    emailteachers: Option<u8>,
}

#[derive(Debug, Default, Deserialize)]
struct GradeSettingsInput {
    grade: Option<u16>,
    gradecat: Option<u64>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct ImportQuestionResult {
    question_id: u64,
    redirect_url: String,
    question_response_status: u16,
    test_case_response_status: u16,
}

pub async fn upload(payload: RuntimeUploadPayload) -> Result<RuntimeUploadResult, String> {
    let question: RequiredQuestion =
        serde_json::from_value(payload.question).map_err(|err| format!("题目载荷解析失败: {err}"))?;
    let credentials: Caux8Credentials = serde_json::from_value(payload.credentials)
        .map_err(|err| format!("凭证解析失败: {err}"))?;

    let client = Client::builder()
        .redirect(Policy::none())
        .build()
        .map_err(|err| format!("创建 HTTP client 失败: {err}"))?;

    let question_response = client
        .post(CREATE_QUESTION_ENDPOINT)
        .header(COOKIE, format!("MoodleSession={}", credentials.moodle_session))
        .multipart(build_question_form(&question))
        .send()
        .await
        .map_err(|err| format!("创建题目失败: {err}"))?;

    let question_status = question_response.status().as_u16();
    let location = question_response
        .headers()
        .get(LOCATION)
        .ok_or_else(|| "题目可能已经创建，但未获取重定向链接。".to_string())?
        .to_str()
        .map_err(|err| format!("重定向链接格式不合法: {err}"))?;

    let redirect_url = resolve_redirect_url(location)?;
    let question_id = extract_question_id(&redirect_url)?;

    let testcase_response = client
        .post(CREATE_TESTCASE_ENDPOINT)
        .header(COOKIE, format!("MoodleSession={}", credentials.moodle_session))
        .multipart(build_testcase_form(
            &question.basic_info.sesskey,
            question_id,
            &question.test_cases,
        ))
        .send()
        .await
        .map_err(|err| format!("创建测试点失败: {err}"))?;

    let result = ImportQuestionResult {
        question_id,
        redirect_url,
        question_response_status: question_status,
        test_case_response_status: testcase_response.status().as_u16(),
    };

    Ok(RuntimeUploadResult {
        ok: true,
        message: Some(format!("上传完成，题目 ID: {}", result.question_id)),
        data: Some(serde_json::to_value(result).map_err(|err| format!("序列化上传结果失败: {err}"))?),
    })
}

fn resolve_redirect_url(location: &str) -> Result<String, String> {
    let base = Url::parse(CAU_BASE_URL).map_err(|err| format!("基础 URL 不合法: {err}"))?;
    base.join(location)
        .map(|url| url.to_string())
        .map_err(|err| format!("拼接重定向链接失败: {err}"))
}

fn extract_question_id(redirect_url: &str) -> Result<u64, String> {
    let url = Url::parse(redirect_url).map_err(|err| format!("重定向链接不合法: {err}"))?;
    let question_id = url
        .query_pairs()
        .find(|(key, _)| key == "id")
        .map(|(_, value)| value.into_owned())
        .ok_or_else(|| "无法从重定向 URL 中获取题目 ID。".to_string())?;

    question_id
        .parse::<u64>()
        .map_err(|err| format!("题目 ID 不是有效数字: {err}"))
}

fn build_question_form(question: &RequiredQuestion) -> Form {
    let mut fields = Vec::<(String, String)>::new();

    push_field(&mut fields, "assignmenttype", "onlinejudge");
    push_field(&mut fields, "type", "onlinejudge");
    push_field(
        &mut fields,
        "mform_showadvanced_last",
        question.basic_info.mform_showadvanced_last,
    );
    push_field(&mut fields, "conditiongraderepeats", 1);
    push_field(&mut fields, "conditionfieldrepeats", 1);
    push_field(&mut fields, "course", question.basic_info.course);
    push_field(&mut fields, "coursemodule", "");
    push_field(&mut fields, "section", question.basic_info.section);
    push_field(&mut fields, "module", 1);
    push_field(&mut fields, "modulename", "assignment");
    push_field(&mut fields, "instance", "");
    push_field(&mut fields, "add", "assignment");
    push_field(&mut fields, "update", 0);
    push_field(&mut fields, "return", 0);
    push_field(&mut fields, "sr", 0);
    push_field(&mut fields, "sesskey", &question.basic_info.sesskey);
    push_field(&mut fields, "_qf__mod_assignment_mod_form", 1);
    push_field(&mut fields, "name", &question.basic_info.name);

    push_field(&mut fields, "introeditor[text]", &question.description.text);
    push_field(&mut fields, "introeditor[format]", 1);

    let online_judge = &question.online_judge_settings;
    push_field(
        &mut fields,
        "language",
        online_judge.language.as_deref().unwrap_or("1111_ideone"),
    );
    push_field(&mut fields, "ratiope", online_judge.ratiope.unwrap_or(1.0));
    push_field(&mut fields, "cpulimit", online_judge.cpulimit.unwrap_or(2));
    push_field(
        &mut fields,
        "memlimit",
        online_judge.memlimit.unwrap_or(67108864),
    );
    push_field(
        &mut fields,
        "compileonly",
        online_judge.compileonly.unwrap_or(0),
    );
    push_field(
        &mut fields,
        "preamble",
        online_judge.preamble.as_deref().unwrap_or(""),
    );
    push_field(
        &mut fields,
        "postamble",
        online_judge.postamble.as_deref().unwrap_or(""),
    );
    push_field(
        &mut fields,
        "forbiddenwords",
        online_judge.forbiddenwords.as_deref().unwrap_or(""),
    );

    let submission = &question.submission_settings;
    push_field(&mut fields, "preventlate", submission.preventlate.unwrap_or(0));
    push_field(&mut fields, "maxbytes", submission.maxbytes.unwrap_or(20971520));
    push_field(&mut fields, "resubmit", submission.resubmit.unwrap_or(1));
    push_field(&mut fields, "var1", submission.var1.unwrap_or(1));
    push_field(&mut fields, "var2", submission.var2.unwrap_or(1));
    push_field(&mut fields, "var3", submission.var3.unwrap_or(1));
    push_field(
        &mut fields,
        "emailteachers",
        submission.emailteachers.unwrap_or(0),
    );

    let grade = &question.grade_settings;
    push_field(&mut fields, "grade", grade.grade.unwrap_or(100));
    push_field(&mut fields, "advancedgradingmethod_submission", "");
    push_field(&mut fields, "gradecat", grade.gradecat.unwrap_or(168));

    match question.redirect_target.as_deref() {
        Some("course") => push_field(&mut fields, "submitbutton", "保存并返回课程"),
        Some("none") => {}
        _ => push_field(&mut fields, "submitbutton", "保存并预览"),
    }

    build_form(fields)
}

fn build_testcase_form(sesskey: &str, question_id: u64, testcases: &[TestCase]) -> Form {
    let mut fields = Vec::<(String, String)>::new();

    push_field(&mut fields, "sesskey", sesskey);
    push_field(&mut fields, "id", question_id);
    push_field(&mut fields, "_qf__testcase_form", 1);
    push_field(&mut fields, "submitbutton", "保存更改");

    for (index, testcase) in testcases.iter().enumerate() {
        push_field(&mut fields, format!("caseid[{index}]"), testcase.caseid);
        push_field(&mut fields, format!("input[{index}]"), &testcase.input);
        push_field(&mut fields, format!("output[{index}]"), &testcase.output);
        push_field(&mut fields, format!("feedback[{index}]"), &testcase.feedback);
        push_field(&mut fields, format!("subgrade[{index}]"), &testcase.subgrade);
    }

    build_form(fields)
}

fn push_field(
    fields: &mut Vec<(String, String)>,
    key: impl Into<String>,
    value: impl ToString,
) {
    fields.push((key.into(), value.to_string()));
}

fn build_form(fields: Vec<(String, String)>) -> Form {
    fields
        .into_iter()
        .fold(Form::new(), |form, (key, value)| form.text(key, value))
}
