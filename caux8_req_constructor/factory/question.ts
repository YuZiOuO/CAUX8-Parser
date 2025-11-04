import { appendDefaultBasicInfo, appendDefaultDescription } from "../types/defaults.ts";

export function constructQuestionRequestBody(q: RequiredQuestion): FormData {
    const form = new FormData();
    appendDefaultBasicInfo(q.basicInfo, form);
    appendDefaultDescription(q.description.text, form);
    return form
}