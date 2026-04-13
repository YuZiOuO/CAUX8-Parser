import { appendFields, appendIndexedFields } from "../form-data.js";
import type { TestCase, TestCaseRequestBody } from "../types.js";

export function constructTestCaseRequestBody(
  sesskey: string,
  questionId: number,
  testCases: TestCase[],
): FormData {
  const t: TestCaseRequestBody = {
    sesskey,
    id: questionId,
    _qf__testcase_form: 1,
    submitbutton: "保存更改",
    TestCase: testCases,
  };
  const form = new FormData();

  appendFields(form, {
    sesskey: t.sesskey,
    id: t.id,
    _qf__testcase_form: t._qf__testcase_form,
    submitbutton: t.submitbutton,
  });
  appendIndexedFields(form, t.TestCase);

  return form;
}
