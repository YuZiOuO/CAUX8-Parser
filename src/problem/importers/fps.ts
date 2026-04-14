import type { Problem, ProblemTestCase } from "../model/problem.js";
import { testType } from "../formats/moodle/enums.js";
import {
  createMoodleQuestion,
  createMoodleTestCase,
  tag,
  text,
  type MoodleQuestion,
} from "../formats/moodle/model.js";

export interface FpsImportedProblem {
  source: "fps";
  title: string;
  problem: Problem;
  moodleQuestion: MoodleQuestion;
}

export function parseFpsProblems(xmlText: string): FpsImportedProblem[] {
  const doc = new DOMParser().parseFromString(xmlText, "application/xml");
  const parserError = doc.querySelector("parsererror");
  if (parserError) {
    throw new Error(parserError.textContent?.trim() || "FPS XML 解析失败");
  }

  const items = Array.from(doc.querySelectorAll("item"));
  if (items.length === 0) {
    throw new Error("未找到 FPS item 节点");
  }

  return items.map((item, index) => {
    const problem = parseFpsItem(item, index);
    return {
      source: "fps",
      title: problem.title,
      problem,
      moodleQuestion: parseFpsMoodleQuestion(item, index),
    };
  });
}

export function parseFpsMoodleQuestions(xmlText: string): MoodleQuestion[] {
  const doc = new DOMParser().parseFromString(xmlText, "application/xml");
  const parserError = doc.querySelector("parsererror");
  if (parserError) {
    throw new Error(parserError.textContent?.trim() || "FPS XML 解析失败");
  }

  const items = Array.from(doc.querySelectorAll("item"));
  if (items.length === 0) {
    throw new Error("未找到 FPS item 节点");
  }

  return items.map((item, index) => parseFpsMoodleQuestion(item, index));
}

function parseFpsItem(item: Element, index: number): Problem {
  const title = readText(item, "title") || `FPS Problem ${index + 1}`;
  const description = [
    readText(item, "description"),
    readText(item, "input"),
    readText(item, "output"),
  ]
    .filter(Boolean)
    .join("\n");

  const testCases = buildTestCases(item);

  return {
    title,
    statement: {
      text: description,
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
    limits: {
      timeLimitSeconds: readLimit(item, "time_limit", "time"),
      memoryLimitBytes: readLimit(item, "memory_limit", "memory"),
    },
    grading: {
      totalGrade: 100,
      presentationErrorRatio: 1.0,
    },
    metadata: {
      externalId: title,
      tags: ["fps"],
    },
  };
}

function parseFpsMoodleQuestion(item: Element, index: number): MoodleQuestion {
  const question = createMoodleQuestion();
  const title = readText(item, "title") || `FPS Problem ${index + 1}`;
  const questionText = [
    readText(item, "description"),
    readText(item, "input"),
    readText(item, "output"),
  ]
    .filter(Boolean)
    .join("\n");

  question.header.name = tag(text(title));
  question.header.questiontext = tag(text(questionText), { format: "html" });

  const timeLimit = readLimit(item, "time_limit", "time");
  const memoryLimitBytes = readLimit(item, "memory_limit", "memory");
  question.extra.cputimelimitsecs =
    timeLimit === undefined ? null : tag(String(timeLimit));
  question.extra.memlimitmb =
    memoryLimitBytes === undefined
      ? null
      : tag(String(Math.round(memoryLimitBytes / 1024 / 1024)));

  question.testcases = Object.fromEntries(
    buildTestCases(item).map((testCase, testcaseIndex) => {
      const moodleTestCase = createMoodleTestCase();
      moodleTestCase.attr.testtype = testType.normal;
      moodleTestCase.attr.useasexample = testCase.isExample ? "1" : "0";
      moodleTestCase.stdin = tag(text(testCase.input));
      moodleTestCase.expected = tag(text(testCase.output));
      moodleTestCase.extra = tag(text(testCase.feedback ?? ""));
      return [String(testcaseIndex), moodleTestCase];
    }),
  );

  return question;
}

function buildTestCases(item: Element): ProblemTestCase[] {
  const testCases: ProblemTestCase[] = [];
  const sampleInput = readText(item, "sample_input");
  const sampleOutput = readText(item, "sample_output");
  const testInput = readText(item, "test_input");
  const testOutput = readText(item, "test_output");

  if (sampleInput || sampleOutput) {
    testCases.push({
      input: sampleInput,
      output: sampleOutput,
      feedback: "",
      weight: 1.0,
      isExample: true,
      stopOnFailure: false,
      visibility: "show",
      kind: "normal",
    });
  }

  if (testInput || testOutput) {
    testCases.push({
      input: testInput,
      output: testOutput,
      feedback: "",
      weight: 1.0,
      isExample: false,
      stopOnFailure: false,
      visibility: "show",
      kind: "normal",
    });
  }

  if (testCases.length === 0) {
    testCases.push({
      input: "",
      output: "",
      feedback: "",
      weight: 1.0,
      isExample: true,
      stopOnFailure: false,
      visibility: "show",
      kind: "normal",
    });
  }

  return testCases;
}

function readText(parent: Element, selector: string) {
  return parent.querySelector(selector)?.textContent ?? "";
}

function readLimit(
  item: Element,
  selector: string,
  kind: "time" | "memory",
): number | undefined {
  const node = item.querySelector(selector);
  const value = Number(node?.textContent ?? "");
  const unit = node?.getAttribute("unit")?.toLowerCase();

  if (!Number.isFinite(value) || !unit) {
    return undefined;
  }

  return kind === "time"
    ? convertTimeToSeconds(value, unit)
    : convertMemoryToBytes(value, unit);
}

function convertTimeToSeconds(value: number, unit: string) {
  const factors: Record<string, number> = {
    ms: 1 / 1000,
    s: 1,
    m: 60,
  };

  return factors[unit] === undefined ? undefined : value * factors[unit];
}

function convertMemoryToBytes(value: number, unit: string) {
  const factors: Record<string, number> = {
    b: 1,
    kb: 1024,
    mb: 1024 * 1024,
    gb: 1024 * 1024 * 1024,
    tb: 1024 * 1024 * 1024 * 1024,
  };

  return factors[unit] === undefined ? undefined : Math.round(value * factors[unit]);
}
