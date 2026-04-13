import { caux8QuestionAdapter } from "../platforms/caux8/adapter.js";

export { caux8QuestionAdapter, toCaux8Question } from "../platforms/caux8/adapter.js";
export type { Caux8TargetConfig } from "../platforms/caux8/adapter.js";
export type {
  AdapterFieldOption,
  AdapterFieldSpec,
  QuestionAdapter,
  QuestionAdapterDefinition,
  UploadContext,
} from "./types.js";

export const questionAdapters = [caux8QuestionAdapter];
