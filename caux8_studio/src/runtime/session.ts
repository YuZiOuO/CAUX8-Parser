import { invoke } from "@tauri-apps/api/core";
import {
  createMissingTauriRuntimeError,
  hasTauriInvokeRuntime,
  RuntimeCommandError,
  type RuntimeCommandErrorInfo,
} from "@/runtime/errors";

export interface ResolveCaux8SessionRequest {
  moodleSession: string;
  courseId: number;
}

export interface Caux8CourseSection {
  id: string;
  section: number;
  name?: string | null;
}

export interface Caux8SessionInfo {
  courseId: number;
  sesskey: string;
  loginInfo?: string | null;
  sections: Caux8CourseSection[];
}

export async function resolveCaux8Session(
  request: ResolveCaux8SessionRequest,
): Promise<Caux8SessionInfo> {
  if (!hasTauriInvokeRuntime()) {
    throw createMissingTauriRuntimeError();
  }

  try {
    return await invoke<Caux8SessionInfo>("resolve_caux8_session", {
      request,
    });
  } catch (error) {
    throw normalizeSessionError(error);
  }
}

function normalizeSessionError(error: unknown): RuntimeCommandError {
  if (error instanceof RuntimeCommandError) {
    return error;
  }

  if (isBackendError(error)) {
    return new RuntimeCommandError({
      code: error.code,
      message: error.message,
      detail: error.detail,
      status: error.status,
      raw: error,
    });
  }

  return new RuntimeCommandError({
    code: "resolve_session_error",
    message: error instanceof Error ? error.message : "解析 CAUX8 会话失败",
    detail: error instanceof Error ? error.stack : stringifyUnknown(error),
    raw: error,
  });
}

function isBackendError(value: unknown): value is RuntimeCommandErrorInfo {
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
