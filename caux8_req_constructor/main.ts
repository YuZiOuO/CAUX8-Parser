import { caux8QuestionAdapter } from "./adapters/index.js";
import type { Problem } from "./core/problem.js";

const problem: Problem = {
  title: "test_abc",
  statement: {
    text: "test question",
    format: "plain",
  },
  testCases: [
    {
      input: "1 2\n",
      output: "3\n",
      feedback: "",
      weight: 1.0,
    },
  ],
  execution: {
    language: "1111_ideone",
  },
};

try {
  const result = await caux8QuestionAdapter.upload(problem, {
    target: {
      course: 141,
      section: 10,
      sesskey: "T72pRCtqOa",
    },
    credentials: {
      moodleSession: "76iuuf6rr0tvrgcq23g2leo0b2",
    },
  });
  console.log(result);
} catch (e) {
  console.log(e);
}
