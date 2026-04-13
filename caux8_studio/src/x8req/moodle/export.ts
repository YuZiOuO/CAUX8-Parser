import type {
  MoodleFieldValue,
  MoodleQuestion,
  MoodleTag,
  MoodleTestCase,
  MoodleText,
} from "./model.js";

export function exportMoodleQuestionsToXml(questions: MoodleQuestion[]) {
  return formatXml(
    `<quiz>${questions.map((question) => exportQuestion(question)).join("")}</quiz>`,
  );
}

export function exportMoodleQuestionToXml(question: MoodleQuestion) {
  return exportMoodleQuestionsToXml([question]);
}

function exportQuestion(question: MoodleQuestion) {
  const children = [
    ...Object.entries(question.header).map(([key, value]) =>
      buildNode(key, value),
    ),
    ...Object.entries(question.extra).map(([key, value]) =>
      buildNode(key, value),
    ),
    exportTestCases(question.testcases),
  ]
    .filter(Boolean)
    .join("");

  return `<question${attrs(question.attr)}>${children}</question>`;
}

function exportTestCases(testcases: Record<string, MoodleTestCase>) {
  return `<testcases>${Object.values(testcases)
    .map((testCase) => exportTestCase(testCase))
    .join("")}</testcases>`;
}

function exportTestCase(testCase: MoodleTestCase) {
  const children = Object.entries(testCase)
    .filter(([key]) => key !== "attr")
    .map(([key, value]) => buildNode(key, value as MoodleFieldValue))
    .filter(Boolean)
    .join("");

  return `<testcase${attrs(testCase.attr)}>${children}</testcase>`;
}

function buildNode(key: string, value: MoodleFieldValue): string {
  if (value === null) {
    return "";
  }

  if (typeof value === "string") {
    return `<${key}>${escapeXml(value)}</${key}>`;
  }

  if (isMoodleTag(value)) {
    return `<${key}${attrs(value.attr)}>${exportTagText(value.text)}</${key}>`;
  }

  return exportTestCase(value);
}

function exportTagText(value: string | MoodleText) {
  if (typeof value === "string") {
    return escapeXml(value);
  }

  return `<text>${escapeXml(value.value)}</text>`;
}

function isMoodleTag(value: MoodleTag | MoodleTestCase): value is MoodleTag {
  return "type" in value && value.type === "tag";
}

function attrs(value: Record<string, string>) {
  const entries = Object.entries(value);
  if (entries.length === 0) {
    return "";
  }

  return ` ${entries
    .map(([key, attrValue]) => `${key}="${escapeXml(attrValue)}"`)
    .join(" ")}`;
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function formatXml(xml: string) {
  const declaration = '<?xml version="1.0" encoding="UTF-8"?>';
  const tokens = xml.replace(/></g, ">\n<").split("\n");
  let indent = 0;

  const lines = tokens.map((token) => {
    if (/^<\/.+>$/.test(token)) {
      indent = Math.max(indent - 1, 0);
    }

    const line = `${"    ".repeat(indent)}${token}`;

    if (
      /^<[^!?/][^>]*[^/]?>$/.test(token) &&
      !token.includes("</") &&
      !/^<(text|name|defaultgrade|penalty|display|stdin|expected|extra|testcode)/.test(token)
    ) {
      indent += 1;
    }

    return line;
  });

  return `${declaration}\n${lines.join("\n")}\n`;
}
