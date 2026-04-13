import { importQuestion } from "./upload.js";
import type {
  ImportCredentials,
  ImportQuestionResult,
  RequiredQuestion,
} from "./types.js";
import type { QuestionAdapter } from "../../adapters/types.js";
import {
  caux8QuestionAdapterDefinition,
  toCaux8Question,
  validateCaux8Problem,
} from "./shared.js";
import type { Caux8TargetConfig } from "./shared.js";

export const caux8QuestionAdapter: QuestionAdapter<
  Caux8TargetConfig,
  ImportCredentials,
  RequiredQuestion,
  ImportQuestionResult
> = {
  definition: caux8QuestionAdapterDefinition,

  validate(problem) {
    return validateCaux8Problem(problem);
  },

  toPlatformQuestion(problem, target) {
    return toCaux8Question(problem, target);
  },

  async upload(problem, context) {
    const errors = validateCaux8Problem(problem);
    if (errors.length > 0) {
      throw new Error(`题目数据不合法: ${errors.join("; ")}`);
    }

    return importQuestion(
      this.toPlatformQuestion(problem, context.target),
      context.credentials
    );
  },
};
