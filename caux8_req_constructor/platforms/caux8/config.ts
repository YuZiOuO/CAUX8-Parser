import type {
  GradeSettings,
  OnlineJudgeSettings,
  RedirectTarget,
  SubmissionSettings,
} from "./types.js";

export const CAU_BASE_URL = "http://page.cau.edu.cn";

export const ENDPOINTS = {
  createQuestion: `${CAU_BASE_URL}/course/modedit.php`,
  createTestCase: `${CAU_BASE_URL}/mod/assignment/type/onlinejudge/testcase.php`,
} as const;

export const REDIRECT_BUTTONS: Record<
  Exclude<RedirectTarget, "none">,
  "保存并预览" | "保存并返回课程"
> = {
  preview: "保存并预览",
  course: "保存并返回课程",
};

export const DEFAULT_REDIRECT_TARGET: RedirectTarget = "preview";

export const DEFAULT_ONLINE_JUDGE_SETTINGS: OnlineJudgeSettings = {
  language: "1111_ideone",
  ratiope: 1.0,
  cpulimit: 2,
  memlimit: 67108864,
  compileonly: 0,
  preamble: "",
  postamble: "",
  forbiddenwords: "",
};

export const DEFAULT_SUBMISSION_SETTINGS: SubmissionSettings = {
  preventlate: 0,
  maxbytes: 20971520,
  resubmit: 1,
  var1: 1,
  var2: 1,
  var3: 1,
  emailteachers: 0,
};

export const DEFAULT_GRADE_SETTINGS: GradeSettings = {
  grade: 100,
  advancedgradingmethod_submission: "",
  gradecat: 168,
};
