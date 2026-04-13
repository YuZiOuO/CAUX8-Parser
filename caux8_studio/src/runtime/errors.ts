export interface RuntimeCommandErrorInfo {
  code: string;
  message: string;
  detail?: string;
  status?: number;
  raw?: unknown;
}

export class RuntimeCommandError extends Error {
  readonly info: RuntimeCommandErrorInfo;

  constructor(info: RuntimeCommandErrorInfo) {
    super(info.message);
    this.name = "RuntimeCommandError";
    this.info = info;
  }
}

export function hasTauriInvokeRuntime() {
  return (
    typeof window !== "undefined" &&
    typeof window.__TAURI_INTERNALS__?.invoke === "function"
  );
}

export function createMissingTauriRuntimeError() {
  return new RuntimeCommandError({
    code: "missing_tauri_runtime",
    message:
      "当前不在 Tauri runtime 中。请使用 `bun run tauri:dev` 启动桌面端后再执行操作。",
  });
}

declare global {
  interface Window {
    __TAURI_INTERNALS__?: {
      invoke?: unknown;
    };
  }
}
