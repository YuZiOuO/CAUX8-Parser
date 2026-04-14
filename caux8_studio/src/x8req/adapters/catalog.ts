import type { Problem } from "../core/problem.js";
import type { QuestionAdapterDefinition } from "./types.js";
import {
  caux8QuestionAdapterDefinition,
  createDefaultCaux8TargetConfig,
  toCaux8Question,
  validateCaux8Problem,
} from "../platforms/caux8/shared.js";
import {
  createDefaultMoodleXmlTargetConfig,
  exportProblemToMoodleXml,
  moodleXmlQuestionAdapterDefinition,
  validateMoodleXmlProblem,
} from "../platforms/moodle/index.js";

export interface QuestionAdapterCatalogEntry<TTargetConfig, TPlatformQuestion> {
  definition: QuestionAdapterDefinition;
  createDefaultTargetConfig(): Partial<TTargetConfig>;
  validate(problem: Problem): string[];
  buildSubmission?(
    problem: Problem,
    target: TTargetConfig,
  ): TPlatformQuestion;
  exportXml?(problem: Problem, target: TTargetConfig): string;
}

export const questionAdapterCatalog = {
  "caux8-http": {
    definition: caux8QuestionAdapterDefinition,
    createDefaultTargetConfig: createDefaultCaux8TargetConfig,
    validate: validateCaux8Problem,
    buildSubmission: toCaux8Question,
  },
  "moodle-xml": {
    definition: moodleXmlQuestionAdapterDefinition,
    createDefaultTargetConfig: createDefaultMoodleXmlTargetConfig,
    validate: validateMoodleXmlProblem,
    exportXml: (problem) => exportProblemToMoodleXml(problem),
  },
} as const satisfies Record<string, QuestionAdapterCatalogEntry<any, unknown>>;

export type AdapterId = keyof typeof questionAdapterCatalog;

export const questionAdapterCatalogList: QuestionAdapterCatalogEntry<any, unknown>[] =
  Object.values(questionAdapterCatalog);
