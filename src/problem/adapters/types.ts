import type { Problem } from "../model/problem.js";

export type AdapterAction = "upload" | "export-xml";

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
  disabled?: boolean;
  placeholder?: string;
}

export interface ProblemFieldOverride {
  component: "select";
  options: AdapterFieldOption[];
}

export interface AdapterSessionResolverConfig {
  courseFieldKey: string;
  sesskeyFieldKey: string;
  sectionFieldKey?: string;
  moodleSessionFieldKey: string;
}

export interface QuestionAdapterDefinition {
  id: string;
  displayName: string;
  description: string;
  action: AdapterAction;
  credentialFields: AdapterFieldSpec[];
  targetFields: AdapterFieldSpec[];
  sessionResolver?: AdapterSessionResolverConfig;
  /**
   * Defines overrides for the universal Problem model fields for this specific adapter.
   * Keys are dot-separated paths like `limits.timeLimitSeconds` or `testCases.*.weight`.
   */
  problemFieldOverrides?: Record<string, ProblemFieldOverride>;
}
