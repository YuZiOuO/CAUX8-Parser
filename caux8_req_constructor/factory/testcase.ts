function appendTestCaseFormData(
  index: number,
  testCase: TestCase,
  form: FormData
): FormData {
  for (const [key, value] of Object.entries(testCase)) {
    form.append(`${key}[${index}]`, String(value));
  }
  return form;
}

export function constructTestCaseRequestBody(
  sesskey: string,
  questionId: number,
  testCases: TestCase[]
): FormData {
  const t: TestCaseRequestBody = {
    sesskey,
    id: questionId,
    _qf__testcase_form: 1,
    submitbutton: "保存更改",
    TestCase: testCases,
  };
  const form = new FormData();
  for (const [key, value] of Object.entries(t)) {
    if (key !== "TestCase") {
      form.append(key, String(value));
    } else {
      const cases = value as TestCase[];
      cases.forEach((testCase, index) => {
        appendTestCaseFormData(index, testCase, form);
      });
    }
  }

  return form;
}
