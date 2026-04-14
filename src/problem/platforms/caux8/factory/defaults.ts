import {
  DEFAULT_GRADE_SETTINGS,
  DEFAULT_ONLINE_JUDGE_SETTINGS,
  DEFAULT_REDIRECT_TARGET,
  DEFAULT_SUBMISSION_SETTINGS,
  REDIRECT_BUTTONS,
} from "../config.js";
import { appendFields } from "../form-data.js";
import type {
  BasicInfo,
  Description,
  GradeSettings,
  OnlineJudgeSettings,
  RedirectTarget,
  RequiredBasicInfo,
  SubmissionSettings,
} from "../types.js";

export function appendBasicInfo(
  info: RequiredBasicInfo,
  form: FormData,
): FormData {
  const hiddenInfo: BasicInfo = {
    assignmenttype: "onlinejudge",
    type: "onlinejudge",
    mform_showadvanced_last: info.mform_showadvanced_last,
    conditiongraderepeats: 1,
    conditionfieldrepeats: 1,
    course: info.course,
    coursemodule: "",
    section: info.section,
    module: 1,
    modulename: "assignment",
    instance: "",
    add: "assignment",
    update: 0,
    return: 0,
    sr: 0,
    sesskey: info.sesskey,
    _qf__mod_assignment_mod_form: 1,
    name: info.name,
  };

  return appendFields(form, hiddenInfo);
}

export function appendDescription(text: string, form: FormData): FormData {
  const description: Description = {
    text,
    format: 1,
  };

  return appendFields(form, description, {
    keyTransform: (key) => `introeditor[${key}]`,
  });
}

export function appendOJSettings(
  form: FormData,
  override?: Partial<OnlineJudgeSettings>,
): FormData {
  return appendFields(form, {
    ...DEFAULT_ONLINE_JUDGE_SETTINGS,
    ...override,
  });
}

export function appendRedirectSettings(
  form: FormData,
  target: RedirectTarget = DEFAULT_REDIRECT_TARGET,
): FormData {
  if (target === "none") {
    return form;
  }

  form.append("submitbutton", REDIRECT_BUTTONS[target]);
  return form;
}

export function appendSubmissionSettings(
  form: FormData,
  override?: Partial<SubmissionSettings>,
): FormData {
  return appendFields(form, {
    ...DEFAULT_SUBMISSION_SETTINGS,
    ...override,
  });
}

export function appendGradeSettings(
  form: FormData,
  override?: Partial<GradeSettings>,
): FormData {
  return appendFields(form, {
    ...DEFAULT_GRADE_SETTINGS,
    ...override,
  });
}
