import type { Problem } from "../../core/problem.js";
import type {
  NumberBoolean,
  RedirectTarget,
  RequiredQuestion,
  TestCase,
  TestCaseSubgrade,
} from "./types.js";
import type {
  AdapterFieldSpec,
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

export const caux8CredentialFields: AdapterFieldSpec[] = [
  {
    key: "moodleSession",
    label: "MoodleSession",
    input: "password",
    required: true,
    description: "浏览器里拿到的 MoodleSession Cookie",
    disabled: true,
    placeholder: "在此平台建议通过上方「平台会话抓取」自动获取或在此手动输入",
  },
];

export const caux8TargetFields: AdapterFieldSpec[] = [
  {
    key: "course",
    label: "课程 ID",
    input: "number",
    required: true,
    disabled: true,
    placeholder: "课程ID，通过上方会话抓取自动填写",
  },
  {
    key: "section",
    label: "章节 ID",
    input: "number",
    required: true,
    disabled: true,
    placeholder: "章节ID，通过上方会话抓取自动填写（可选）",
  },
  {
    key: "sesskey",
    label: "Sesskey",
    input: "password",
    required: true,
    description: "必须和 MoodleSession 对应",
    disabled: true,
    placeholder: "Sesskey，通过上方会话抓取自动填写",
  },
  {
    key: "gradeCategory",
    label: "成绩分类",
    input: "number",
    required: false,
    defaultValue: 168,
  },
  {
    key: "redirectTarget",
    label: "保存后跳转",
    input: "select",
    required: false,
    defaultValue: "preview",
    options: [
      { label: "预览页", value: "preview" },
      { label: "课程页", value: "course" },
      { label: "不跳转", value: "none" },
    ],
  },
];

export const SUPPORTED_SUBGRADES: readonly TestCaseSubgrade[] = [
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

export const caux8QuestionAdapterDefinition = {
  id: "caux8-http",
  displayName: "学吧/旧Moodle(page.cau.edu.cn)",
  description: "通过 CAU Moodle 表单接口直接创建题目并上传测试用例",
  action: "upload",
  credentialFields: caux8CredentialFields,
  targetFields: caux8TargetFields,
  sessionResolver: {
    courseFieldKey: "course",
    sectionFieldKey: "section",
    sesskeyFieldKey: "sesskey",
    moodleSessionFieldKey: "moodleSession",
  },
  problemFieldOverrides: {
    "execution.language": {
      component: "select",
      options: [
        { label: "C (gcc)", value: "1111_ideone" },
        { label: "C++ (g++)", value: "11_ideone" },
        { label: "Java", value: "10_ideone" },
        { label: "Python3", value: "116_ideone" },
      ],
    },
    "limits.timeLimitSeconds": {
      component: "select",
      options: Array.from({ length: 10 }, (_, i) => ({
        label: `${i + 1} s`,
        value: i + 1,
      })),
    },
    "testCases.*.weight": {
      component: "select",
      options: SUPPORTED_SUBGRADES.map((val) => ({
        label: val === "0.0" ? "0%" : `${(Number(val) * 100).toFixed(1)}%`,
        value: Number(val),
      })),
    },
  },
} satisfies QuestionAdapterDefinition;

function omitUndefined<T extends object>(value: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(value).filter(([, fieldValue]) => fieldValue !== undefined),
  ) as Partial<T>;
}

export function validateCaux8Problem(problem: Problem): string[] {
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
    (problem.limits.timeLimitSeconds < 1 ||
      problem.limits.timeLimitSeconds > 10)
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
  target: Caux8TargetConfig,
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

export function createDefaultCaux8TargetConfig(): Partial<Caux8TargetConfig> {
  return {
    gradeCategory: 168,
    redirectTarget: "preview",
    mformShowAdvancedLast: 0,
  };
}
