import type { Problem } from "@/x8req/core/problem.js";

export function createDefaultProblem(): Problem {
  return {
    title: "A + B",
    statement: {
      text: "<p>输入两个整数，输出它们的和。</p>",
      format: "html",
    },
    generalFeedback: {
      text: "<p>注意处理换行。</p>",
      format: "html",
    },
    testCases: [
      {
        input: "1 2\n",
        output: "3\n",
        feedback: "",
        weight: 1.0,
        isExample: true,
        stopOnFailure: false,
        visibility: "show",
        kind: "normal",
      },
    ],
    execution: {
      language: "1111_ideone",
      compileOnly: false,
      preamble: "",
      postamble: "",
      forbiddenWords: "",
    },
    limits: {
      timeLimitSeconds: 2,
      memoryLimitBytes: 67108864,
    },
    grading: {
      totalGrade: 100,
      presentationErrorRatio: 1.0,
    },
    metadata: {
      externalId: "demo-ab",
      tags: ["demo", "math"],
    },
  };
}
