import { invoke } from "@tauri-apps/api/core";
import type { DynamicFormState } from "@/studio/types";

export interface RuntimeUploadPayload {
  adapterId: string;
  question: unknown;
  credentials: DynamicFormState;
}

export interface RuntimeUploadResult {
  ok: boolean;
  message?: string;
  data?: unknown;
}

declare global {
  interface Window {
    __TAURI_INTERNALS__?: {
      invoke?: unknown;
    };
  }
}

function hasTauriInvokeRuntime() {
  return (
    typeof window !== "undefined" &&
    typeof window.__TAURI_INTERNALS__?.invoke === "function"
  );
}

export async function uploadProblemViaRuntime(
  payload: RuntimeUploadPayload,
): Promise<RuntimeUploadResult> {
  if (!hasTauriInvokeRuntime()) {
    throw new Error(
      "当前不在 Tauri runtime 中。请使用 `bun run tauri:dev` 启动桌面端后再执行上传。",
    );
  }

  return invoke<RuntimeUploadResult>("upload_problem", {
    payload,
  });
}
