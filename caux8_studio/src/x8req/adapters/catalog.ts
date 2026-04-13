import type { Problem } from "../core/problem.js";
import type { QuestionAdapterDefinition } from "./types.js";
import {
  caux8QuestionAdapterDefinition,
  createDefaultCaux8TargetConfig,
  toCaux8Question,
  validateCaux8Problem,
} from "../platforms/caux8/shared.js";
import type { Caux8TargetConfig } from "../platforms/caux8/shared.js";

export interface QuestionAdapterCatalogEntry<TTargetConfig, TPlatformQuestion> {
  definition: QuestionAdapterDefinition;
  createDefaultTargetConfig(): Partial<TTargetConfig>;
  validate(problem: Problem): string[];
  toPlatformQuestion(
    problem: Problem,
    target: TTargetConfig
  ): TPlatformQuestion;
}

export const questionAdapterCatalog: QuestionAdapterCatalogEntry<
  Caux8TargetConfig,
  ReturnType<typeof toCaux8Question>
>[] = [
  {
    definition: caux8QuestionAdapterDefinition,
    createDefaultTargetConfig: createDefaultCaux8TargetConfig,
    validate: validateCaux8Problem,
    toPlatformQuestion: toCaux8Question,
  },
];
