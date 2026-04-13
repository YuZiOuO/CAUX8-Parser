import { importQuestion } from "./upload.js";
import type { Problem } from "../../core/problem.js";
import type {
  ImportCredentials,
  ImportQuestionResult,
  NumberBoolean,
  RedirectTarget,
  RequiredQuestion,
  TestCase,
  TestCaseSubgrade,
} from "./types.js";
import type {
  AdapterFieldSpec,
  QuestionAdapter,
  QuestionAdapterDefinition,
} from "../../adapters/types.js";

export interface Caux8TargetConfig {
  course: number;
  section: number;
  sesskey: string;
  mformShowAdvancedLast?: NumberBoolean;
  redirectTarget?: RedirectTarget;
  gradeCategory?: number;
}

const credentialFields: AdapterFieldSpec[] = [
  {
    key: "moodleSession",
    label: "MoodleSession",
    input: "password",
    required: true,
    description: "浏览器里拿到的 MoodleSession Cookie",
  },
];

const targetFields: AdapterFieldSpec[] = [
  {
    key: "course",
    label: "Course ID",
    input: "number",
    required: true,
  },
  {
    key: "section",
    label: "Section ID",
    input: "number",
    required: true,
  },
  {
    key: "sesskey",
    label: "Sesskey",
    input: "password",
    required: true,
    description: "必须和 MoodleSession 对应",
  },
  {
    key: "gradeCategory",
    label: "Grade Category",
    input: "number",
    required: false,
    defaultValue: 168,
  },
  {
    key: "redirectTarget",
    label: "Redirect After Save",
    input: "select",
    required: false,
    defaultValue: "preview",
    options: [
      { label: "Preview", value: "preview" },
      { label: "Course", value: "course" },
      { label: "None", value: "none" },
    ],
  },
];

const definition: QuestionAdapterDefinition = {
  id: "caux8-http",
  displayName: "CAU Moodle HTTP",
  description: "通过 CAU Moodle 表单接口直接创建题目并上传测试用例",
  credentialFields,
  targetFields,
};

const SUPPORTED_SUBGRADES: readonly TestCaseSubgrade[] = [
  "0.0",
  "1.0",
  "0.9",
  "0.8333333",
  "0.8",
  "0.75",
  "0.7",
  "0.6666667",
  "0.6",
  "0.5",
  "0.4",
  "0.3333333",
  "0.3",
  "0.25",
  "0.2",
  "0.1666667",
  "0.1428571",
  "0.125",
  "0.1111111",
  "0.1",
  "0.05",
];

function omitUndefined<T extends object>(value: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(value).filter(([, fieldValue]) => fieldValue !== undefined)
  ) as Partial<T>;
}

function validateProblem(problem: Problem): string[] {
  const errors: string[] = [];

  if (problem.title.trim() === "") {
    errors.push("title 不能为空");
  }

  if (problem.statement.text.trim() === "") {
    errors.push("statement.text 不能为空");
  }

  if (problem.testCases.length === 0) {
    errors.push("至少需要一个测试用例");
  }

  if (
    problem.limits?.timeLimitSeconds !== undefined &&
    !Number.isInteger(problem.limits.timeLimitSeconds)
  ) {
    errors.push("limits.timeLimitSeconds 必须是整数秒");
  }

  if (
    problem.limits?.timeLimitSeconds !== undefined &&
    (problem.limits.timeLimitSeconds < 1 || problem.limits.timeLimitSeconds > 10)
  ) {
    errors.push("CAUX8 平台当前只支持 1-10 秒的 timeLimitSeconds");
  }

  problem.testCases.forEach((testCase, index) => {
    if (
      testCase.weight !== undefined &&
      !SUPPORTED_SUBGRADES.includes(String(testCase.weight) as TestCaseSubgrade)
    ) {
      errors.push(`testCases[${index}].weight 不是 CAUX8 支持的分值比例`);
    }
  });

  return errors;
}

function toCompileOnlyFlag(compileOnly?: boolean): NumberBoolean | undefined {
  if (compileOnly === undefined) {
    return undefined;
  }

  return compileOnly ? 1 : 0;
}

function toSubgrade(weight?: number): TestCaseSubgrade {
  if (weight === undefined) {
    return "1.0";
  }

  const subgrade = String(weight) as TestCaseSubgrade;
  if (!SUPPORTED_SUBGRADES.includes(subgrade)) {
    throw new Error(`CAUX8 不支持的测试点权重: ${weight}`);
  }

  return subgrade;
}

function toCaux8TestCase(problem: Problem): TestCase[] {
  return problem.testCases.map((testCase) => ({
    caseid: -1,
    input: testCase.input,
    output: testCase.output,
    feedback: testCase.feedback ?? "",
    subgrade: toSubgrade(testCase.weight),
  }));
}

export function toCaux8Question(
  problem: Problem,
  target: Caux8TargetConfig
): RequiredQuestion {
  return {
    basicInfo: {
      name: problem.title,
      course: target.course,
      section: target.section,
      mform_showadvanced_last: target.mformShowAdvancedLast ?? 0,
      sesskey: target.sesskey,
    },
    description: {
      text: problem.statement.text,
    },
    testCases: toCaux8TestCase(problem),
    redirectTarget: target.redirectTarget,
    onlineJudgeSettings: omitUndefined({
      language: problem.execution?.language,
      ratiope: problem.grading?.presentationErrorRatio,
      cpulimit: problem.limits?.timeLimitSeconds as
        | 1
        | 2
        | 3
        | 4
        | 5
        | 6
        | 7
        | 8
        | 9
        | 10
        | undefined,
      memlimit: problem.limits?.memoryLimitBytes,
      compileonly: toCompileOnlyFlag(problem.execution?.compileOnly),
      preamble: problem.execution?.preamble,
      postamble: problem.execution?.postamble,
      forbiddenwords: problem.execution?.forbiddenWords,
    }),
    gradeSettings: omitUndefined({
      grade: problem.grading?.totalGrade,
      gradecat: target.gradeCategory,
    }),
  };
}

export const caux8QuestionAdapter: QuestionAdapter<
  Caux8TargetConfig,
  ImportCredentials,
  RequiredQuestion,
  ImportQuestionResult
> = {
  definition,

  validate(problem) {
    return validateProblem(problem);
  },

  toPlatformQuestion(problem, target) {
    return toCaux8Question(problem, target);
  },

  async upload(problem, context) {
    const errors = validateProblem(problem);
    if (errors.length > 0) {
      throw new Error(`题目数据不合法: ${errors.join("; ")}`);
    }

    return importQuestion(
      this.toPlatformQuestion(problem, context.target),
      context.credentials
    );
  },
};
