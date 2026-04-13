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

interface TauriCore {
  invoke<T>(command: string, args?: Record<string, unknown>): Promise<T>;
}

declare global {
  interface Window {
    __TAURI__?: {
      core?: TauriCore;
    };
  }
}

export function isTauriRuntime() {
  return typeof window !== "undefined" && !!window.__TAURI__?.core?.invoke;
}

export async function uploadProblemViaRuntime(
  payload: RuntimeUploadPayload,
): Promise<RuntimeUploadResult> {
  if (!isTauriRuntime()) {
    throw new Error(
      "浏览器模式下不直接上传。要避免 CORS，建议通过 Tauri command 在桌面端执行上传。",
    );
  }

  return window.__TAURI__!.core!.invoke<RuntimeUploadResult>("upload_problem", {
    payload,
  });
}
