import type { Problem } from "../core/problem.js";

export type AdapterFieldInputType =
  | "text"
  | "textarea"
  | "number"
  | "password"
  | "select";

export interface AdapterFieldOption {
  label: string;
  value: string | number;
}

export interface AdapterFieldSpec {
  key: string;
  label: string;
  input: AdapterFieldInputType;
  required: boolean;
  description?: string;
  defaultValue?: string | number;
  options?: AdapterFieldOption[];
}

export interface ProblemFieldOverride {
  component: "select";
  options: AdapterFieldOption[];
}

export interface QuestionAdapterDefinition {
  id: string;
  displayName: string;
  description: string;
  credentialFields: AdapterFieldSpec[];
  targetFields: AdapterFieldSpec[];
  /**
   * Defines overrides for the universal Problem model fields for this specific adapter.
   * Keys are dot-separated paths like `limits.timeLimitSeconds` or `testCases.*.weight`.
   */
  problemFieldOverrides?: Record<string, ProblemFieldOverride>;
}

export interface UploadContext<TTargetConfig, TCredentials> {
  target: TTargetConfig;
  credentials: TCredentials;
}

export interface QuestionAdapter<
  TTargetConfig,
  TCredentials,
  TPlatformQuestion,
  TResult,
> {
  readonly definition: QuestionAdapterDefinition;

  validate(problem: Problem): string[];

  toPlatformQuestion(
    problem: Problem,
    target: TTargetConfig,
  ): TPlatformQuestion;

  upload(
    problem: Problem,
    context: UploadContext<TTargetConfig, TCredentials>,
  ): Promise<TResult>;
}
