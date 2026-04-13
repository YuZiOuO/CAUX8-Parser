import type { Problem, ProblemTestCase } from "../core/problem.js";
import { problemToMoodleQuestion, type MoodleQuestion } from "../moodle/index.js";

export interface YbtImportedProblem {
  source: "ybt";
  title: string;
  problem: Problem;
  moodleQuestion: MoodleQuestion;
}

export type YbtFileMap = Record<string, string>;

export function parseYbtProblem(
  jsonText: string,
  files: YbtFileMap = {},
): YbtImportedProblem {
  const data = JSON.parse(jsonText) as Record<string, any>;
  const title = data.localizedContentsOfLocale?.title ?? "YBT Problem";
  const sections = data.localizedContentsOfLocale?.contentSections ?? [];
  const statement = sections
    .map((section: any) => `${section.sectionTitle ?? ""}:${section.text ?? ""}`)
    .join("\n");
  const testCases = buildYbtTestCases(data, files);

  const problem: Problem = {
    title,
    statement: {
      text: statement,
      format: "html",
    },
    generalFeedback: {
      text: "",
      format: "html",
    },
    testCases,
    execution: {
      language: "1111_ideone",
      compileOnly: false,
      preamble: "",
      postamble: "",
      forbiddenWords: "",
    },
    limits: {},
    grading: {
      totalGrade: 100,
      presentationErrorRatio: 1.0,
    },
    metadata: {
      externalId: title,
      tags: ["ybt"],
    },
  };

  return {
    source: "ybt",
    title,
    problem,
    moodleQuestion: problemToMoodleQuestion(problem),
  };
}

function buildYbtTestCases(
  data: Record<string, any>,
  files: YbtFileMap,
): ProblemTestCase[] {
  const testCases: ProblemTestCase[] = [];

  for (const sample of data.samples ?? []) {
    testCases.push({
      input: sample.inputData ?? "",
      output: sample.outputData ?? "",
      feedback: "",
      weight: 0,
      isExample: true,
      stopOnFailure: false,
      visibility: "show",
      kind: "normal",
    });
  }

  for (const subtask of data.judgeInfo?.subtasks ?? []) {
    for (const testcase of subtask.testcases ?? []) {
      const inputFile = testcase.inputFile;
      const outputFile = testcase.outputFile;
      testCases.push({
        input: files[inputFile] ?? "",
        output: files[outputFile] ?? "",
        feedback:
          files[inputFile] === undefined || files[outputFile] === undefined
            ? `未提供测试文件: ${inputFile}, ${outputFile}`
            : "",
        weight: 1.0,
        isExample: false,
        stopOnFailure: false,
        visibility: "show",
        kind: "normal",
      });
    }
  }

  return testCases.length === 0
    ? [
        {
          input: "",
          output: "",
          feedback: "",
          weight: 1.0,
          isExample: true,
          stopOnFailure: false,
          visibility: "show",
          kind: "normal",
        },
      ]
    : testCases;
}
