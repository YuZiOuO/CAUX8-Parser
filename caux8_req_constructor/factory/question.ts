import { appendDefaultBasicInfo, appendDefaultDescription } from "../types/defaults.js";

export function constructQuestionRequestBody(courseId: number, q: RequiredQuestion): FormData {
    const form = new FormData();
    appendDefaultBasicInfo({...q.basicInfo, courseId}, form);
    appendDefaultDescription(q.description.text, form);
    return form
}