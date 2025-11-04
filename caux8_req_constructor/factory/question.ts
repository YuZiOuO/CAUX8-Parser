import { appendBasicInfo, appendDescription, appendGradeSettings, appendOJSettings, appendRedirectSettings, appendSubmissionSettings } from "./defaults.ts";

export function constructQuestionRequestBody(q: RequiredQuestion): FormData {
    const form = new FormData();
    appendBasicInfo(q.basicInfo, form);
    appendDescription(q.description.text, form);
    appendRedirectSettings(form);
    appendSubmissionSettings(form);
    appendOJSettings(form);
    appendGradeSettings(form);
    return form
}