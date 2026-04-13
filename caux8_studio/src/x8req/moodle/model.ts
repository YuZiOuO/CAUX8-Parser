import { coderunnerType } from "./enums.js";

export interface MoodleText {
  type: "text";
  value: string;
}

export interface MoodleTag {
  type: "tag";
  text: string | MoodleText;
  attr: Record<string, string>;
}

export type MoodleFieldValue = string | MoodleTag | MoodleTestCase | null;

export interface MoodleTestCase {
  attr: Record<string, string>;
  testcode: MoodleTag;
  stdin: MoodleTag;
  expected: MoodleTag;
  extra: MoodleTag;
  display: MoodleTag;
}

export interface MoodleQuestion {
  attr: Record<string, string>;
  header: Record<string, MoodleFieldValue>;
  extra: Record<string, MoodleFieldValue>;
  testcases: Record<string, MoodleTestCase>;
}

export function text(value = ""): MoodleText {
  return {
    type: "text",
    value,
  };
}

export function tag(
  value: string | MoodleText = text(),
  attr: Record<string, string> = {},
): MoodleTag {
  return {
    type: "tag",
    text: value,
    attr,
  };
}

export function createMoodleQuestion(): MoodleQuestion {
  return {
    attr: {
      type: "coderunner",
    },
    header: {
      name: tag(text()),
      questiontext: tag(text(), { format: "html" }),
      generalfeedback: tag(text(), { format: "html" }),
      idnumber: null,
      defaultgrade: "100",
      penalty: "0",
    },
    extra: {
      allornothing: "0",
      precheck: "0",
      answerboxlines: "15",
      answerboxcolumns: "90",
      validateonsave: "1",
      answerpreload: "",
      globalextra: "",
      useace: "1",
      iscombinatortemplate: "0",
      template: "",
      templateparamslang: "twig",
      templateparamsevalpertry: "0",
      templateparamsevald: "",
      uiparameters: "",
      hidecheck: "0",
      attachments: "0",
      extractcodefromjson: "1",
      giveupallowed: "0",
      coderunnertype: coderunnerType.multilanguage,
      prototypetype: null,
      penaltyregime: null,
      showsource: null,
      resultcolumns: null,
      allowmultiplestdins: null,
      answer: null,
      testsplitterre: null,
      language: null,
      acelang: null,
      sandbox: null,
      grader: null,
      cputimelimitsecs: null,
      memlimitmb: null,
      sandboxparams: null,
      templateparams: null,
      hoisttemplateparams: null,
      twigall: null,
      uiplugin: null,
      attachmentsrequired: null,
      maxfilesize: "1024000",
      filenamesregex: null,
      filenamesexplain: null,
      displayfeedback: null,
      prototypeextra: null,
    },
    testcases: {},
  };
}

export function createMoodleTestCase(): MoodleTestCase {
  return {
    attr: {
      mark: "1.0",
      hiderestiffail: "0",
      testtype: "0",
      useasexample: "0",
    },
    testcode: tag(text()),
    stdin: tag(text()),
    expected: tag(text()),
    extra: tag(text()),
    display: tag(text("SHOW")),
  };
}
