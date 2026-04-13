import { caux8QuestionAdapter } from "../platforms/caux8/adapter.js";

export { caux8QuestionAdapter } from "../platforms/caux8/adapter.js";
export { toCaux8Question } from "../platforms/caux8/shared.js";
export type { Caux8TargetConfig } from "../platforms/caux8/shared.js";
export type {
  AdapterFieldOption,
  AdapterFieldSpec,
  QuestionAdapter,
  QuestionAdapterDefinition,
  UploadContext,
} from "./types.js";
export type { QuestionAdapterCatalogEntry } from "./catalog.js";
export { questionAdapterCatalog } from "./catalog.js";

export const questionAdapters = [caux8QuestionAdapter];
