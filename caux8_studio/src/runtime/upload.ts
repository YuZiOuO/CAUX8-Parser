import { invoke } from "@tauri-apps/api/core";
import {
  createMissingTauriRuntimeError,
  hasTauriInvokeRuntime,
  RuntimeCommandError,
  type RuntimeCommandErrorInfo,
} from "@/runtime/errors";
import type { DynamicFormState } from "@/studio/types";

export interface RuntimeSubmitPayload {
  adapterId: string;
  question: unknown;
  credentials: DynamicFormState;
}

export interface RuntimeSubmitResult {
  ok: boolean;
  message?: string;
  data?: unknown;
}

export async function submitProblemViaRuntime(
  payload: RuntimeSubmitPayload,
): Promise<RuntimeSubmitResult> {
  if (!hasTauriInvokeRuntime()) {
    throw createMissingTauriRuntimeError();
  }

  try {
    return await invoke<RuntimeSubmitResult>("submit_problem", {
      payload,
    });
  } catch (error) {
    throw normalizeSubmitError(error);
  }
}

function normalizeSubmitError(error: unknown): RuntimeCommandError {
  if (error instanceof RuntimeCommandError) {
    return error;
  }

  if (isBackendSubmitError(error)) {
    return new RuntimeCommandError({
      code: error.code,
      message: error.message,
      detail: error.detail,
      status: error.status,
      raw: error,
    });
  }

  if (error instanceof Error) {
    return new RuntimeCommandError({
      code: "frontend_runtime_error",
      message: error.message,
      detail: error.stack,
      raw: error,
    });
  }

  return new RuntimeCommandError({
    code: "unknown_upload_error",
    message: typeof error === "string" ? error : "上传失败",
    detail: stringifyUnknown(error),
    raw: error,
  });
}

function isBackendSubmitError(value: unknown): value is RuntimeCommandErrorInfo {
  return (
    typeof value === "object" &&
    value !== null &&
    "code" in value &&
    "message" in value &&
    typeof (value as { code: unknown }).code === "string" &&
    typeof (value as { message: unknown }).message === "string"
  );
}

function stringifyUnknown(value: unknown) {
  if (value === undefined) {
    return undefined;
  }

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}
