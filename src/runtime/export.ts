import { save } from "@tauri-apps/plugin-dialog";
import { writeTextFile } from "@tauri-apps/plugin-fs";
import {
  createMissingTauriRuntimeError,
  hasTauriInvokeRuntime,
  RuntimeCommandError,
  type RuntimeCommandErrorInfo,
} from "@/runtime/errors";

export interface ExportXmlToFileRequest {
  xml: string;
  defaultFileName: string;
}

export interface ExportXmlToFileResult {
  canceled: boolean;
  path?: string;
}

export async function exportXmlToFile(
  request: ExportXmlToFileRequest,
): Promise<ExportXmlToFileResult> {
  if (!hasTauriInvokeRuntime()) {
    throw createMissingTauriRuntimeError();
  }

  const fileName = ensureXmlExtension(sanitizeFileName(request.defaultFileName));

  try {
    const path = await save({
      title: "导出 Moodle XML",
      defaultPath: fileName,
      filters: [
        {
          name: "Moodle XML",
          extensions: ["xml"],
        },
      ],
    });

    if (!path) {
      return { canceled: true };
    }

    await writeTextFile(path, request.xml);
    return { canceled: false, path };
  } catch (error) {
    throw normalizeExportError(error);
  }
}

function normalizeExportError(error: unknown): RuntimeCommandError {
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
    code: "export_xml_file_error",
    message: error instanceof Error ? error.message : "导出 XML 文件失败",
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

function sanitizeFileName(fileName: string) {
  const normalized = fileName.trim().replace(/[\\/:*?"<>|]+/g, "-");
  return normalized === "" ? "problem.xml" : normalized;
}

function ensureXmlExtension(fileName: string) {
  return fileName.toLowerCase().endsWith(".xml") ? fileName : `${fileName}.xml`;
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
