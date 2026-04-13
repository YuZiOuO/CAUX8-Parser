import type { Problem } from "../../core/problem.js";
import {
  exportMoodleQuestionToXml,
  problemToMoodleQuestion,
} from "../../moodle/index.js";

export interface MoodleXmlTargetConfig {}

export const moodleXmlQuestionAdapterDefinition = {
  id: "moodle-xml",
  displayName: "Moodle XML",
  description: "导出 Moodle CodeRunner XML，用于后续导入平台，不直接发起上传请求",
  action: "export-xml" as const,
  credentialFields: [],
  targetFields: [],
};

export function createDefaultMoodleXmlTargetConfig(): Partial<MoodleXmlTargetConfig> {
  return {};
}

export function validateMoodleXmlProblem(problem: Problem): string[] {
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

  return errors;
}

export function exportProblemToMoodleXml(problem: Problem) {
  return exportMoodleQuestionToXml(problemToMoodleQuestion(problem));
}
