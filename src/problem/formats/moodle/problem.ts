import type { Problem, ProblemTestCase } from "../../model/problem.js";
import { feedback, testType } from "./enums.js";
import {
  createMoodleQuestion,
  createMoodleTestCase,
  tag,
  text,
  type MoodleQuestion,
} from "./model.js";

export function problemToMoodleQuestion(problem: Problem): MoodleQuestion {
  const question = createMoodleQuestion();

  question.header.name = tag(text(problem.title));
  question.header.questiontext = tag(text(problem.statement.text), {
    format: problem.statement.format === "plain" ? "moodle_auto_format" : "html",
  });
  question.header.generalfeedback = tag(
    text(problem.generalFeedback?.text ?? ""),
    { format: problem.generalFeedback?.format === "plain" ? "moodle_auto_format" : "html" },
  );
  question.header.idnumber = problem.metadata?.externalId ?? null;
  question.header.defaultgrade = String(problem.grading?.totalGrade ?? 100);

  question.extra.cputimelimitsecs =
    problem.limits?.timeLimitSeconds === undefined
      ? null
      : String(problem.limits.timeLimitSeconds);
  question.extra.memlimitmb =
    problem.limits?.memoryLimitBytes === undefined
      ? null
      : String(Math.round(problem.limits.memoryLimitBytes / 1024 / 1024));

  question.testcases = Object.fromEntries(
    problem.testCases.map((testCase, index) => [
      String(index),
      problemTestCaseToMoodleTestCase(testCase),
    ]),
  );

  return question;
}

function problemTestCaseToMoodleTestCase(testCase: ProblemTestCase) {
  const moodleTestCase = createMoodleTestCase();

  moodleTestCase.attr.mark = String(testCase.weight ?? 1.0);
  moodleTestCase.attr.hiderestiffail = testCase.stopOnFailure ? "1" : "0";
  moodleTestCase.attr.testtype = toMoodleTestType(testCase.kind);
  moodleTestCase.attr.useasexample = testCase.isExample ? "1" : "0";
  moodleTestCase.stdin = tag(text(testCase.input));
  moodleTestCase.expected = tag(text(testCase.output));
  moodleTestCase.extra = tag(text(testCase.feedback ?? ""));
  moodleTestCase.display = tag(
    text(testCase.visibility === "hide" ? feedback.hide : "SHOW"),
  );

  return moodleTestCase;
}

function toMoodleTestType(kind: ProblemTestCase["kind"]) {
  if (kind === "precheck") {
    return testType.precheck;
  }

  if (kind === "both") {
    return testType.both;
  }

  return testType.normal;
}
