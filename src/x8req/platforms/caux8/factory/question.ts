import {
  appendBasicInfo,
  appendDescription,
  appendGradeSettings,
  appendOJSettings,
  appendRedirectSettings,
  appendSubmissionSettings,
} from "./defaults.js";
import type { RequiredQuestion } from "../types.js";

export function constructQuestionRequestBody(
  question: RequiredQuestion,
): FormData {
  const form = new FormData();

  appendBasicInfo(question.basicInfo, form);
  appendDescription(question.description.text, form);
  appendRedirectSettings(form, question.redirectTarget);
  appendSubmissionSettings(form, question.submissionSettings);
  appendOJSettings(form, question.onlineJudgeSettings);
  appendGradeSettings(form, question.gradeSettings);

  return form;
}
