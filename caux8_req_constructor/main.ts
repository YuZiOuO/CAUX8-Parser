import { importQuestion } from "./bootstrap.ts";

const q: RequiredQuestion = {
  basicInfo: {
    name: "test_abc",
    course: 141,
    section: 10,
    mform_showadvanced_last: 0,
    sesskey: "T72pRCtqOa",
  },
  description: { text: "test question" },
  testCases: [
    {
      caseid: -1,
      input: "1 2\n",
      output: "3\n",
      subgrade: "1.0",
      feedback: "",
    },
  ],
};

try {
  await importQuestion(q, "76iuuf6rr0tvrgcq23g2leo0b2", "T72pRCtqOa");
} catch (e) {
  console.log(e);
}
