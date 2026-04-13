import { computed, reactive, ref, toRaw, watch } from "vue";
import { questionAdapterCatalog } from "@/x8req/adapters/catalog.js";
import type { ProblemFieldOverride } from "@/x8req/adapters/types.js";
import type { DynamicFormState, PrimitiveFormValue } from "@/studio/types";
import { createDefaultProblem } from "@/studio/default-problem";
import type {
  Caux8CourseSection,
  Caux8SessionInfo,
} from "@/runtime/session";
import {
  uploadProblemViaRuntime,
  type RuntimeUploadResult,
} from "@/runtime/upload";

function resetFormState(target: DynamicFormState, next: DynamicFormState) {
  for (const key of Object.keys(target)) {
    delete target[key];
  }

  Object.assign(target, next);
}

function createFieldState(
  fields: { key: string; defaultValue?: string | number }[],
): DynamicFormState {
  return Object.fromEntries(
    fields.map((field) => [
      field.key,
      (field.defaultValue ?? null) as PrimitiveFormValue,
    ]),
  );
}

export function useStudioState() {
  const adapterOptions = questionAdapterCatalog.map((entry) => ({
    label: entry.definition.displayName,
    value: entry.definition.id,
  }));

  const selectedAdapterId = ref(adapterOptions[0]?.value ?? "");

  const selectedAdapter = computed(() => {
    return (
      questionAdapterCatalog.find(
        (entry) => entry.definition.id === selectedAdapterId.value,
      ) ?? questionAdapterCatalog[0]
    );
  });

  const problem = reactive(createDefaultProblem());
  const targetConfig = reactive<DynamicFormState>({});
  const credentialConfig = reactive<DynamicFormState>({});
  const uploading = ref(false);

  function initializeDynamicState() {
    const adapter = selectedAdapter.value;
    const nextTarget = createFieldState(adapter.definition.targetFields);
    Object.assign(nextTarget, adapter.createDefaultTargetConfig());

    const nextCredentials = Object.fromEntries(
      adapter.definition.credentialFields.map((field) => [field.key, null]),
    ) as DynamicFormState;

    resetFormState(targetConfig, nextTarget);
    resetFormState(credentialConfig, nextCredentials);
  }

  watch(selectedAdapterId, initializeDynamicState, { immediate: true, flush: "sync" });

  const validationErrors = computed(() => selectedAdapter.value.validate(problem));

  // 将验证错误列表解析为以字段路径为 key 的对象，方便对齐到具体表单项
  const validationErrorMap = computed(() => {
    const map: Record<string, string> = {};
    for (const err of validationErrors.value) {
      const match = err.match(/^([\w\[\].]+)/);
      if (match) {
        map[match[1]] = err;
      }
    }
    return map;
  });

  function getFieldOverride(path: string): ProblemFieldOverride | null {
    const overrides = selectedAdapter.value.definition.problemFieldOverrides;
    if (!overrides) return null;

    if (overrides[path]) {
      return overrides[path];
    }

    const wildcardPath = path.replace(/\[\d+\]/g, ".*");
    if (overrides[wildcardPath]) {
      return overrides[wildcardPath];
    }

    return null;
  }

  const targetMissingFields = computed(() =>
    selectedAdapter.value.definition.targetFields
      .filter((field) => field.required)
      .filter((field) => {
        const value = targetConfig[field.key];
        return value === null || value === "";
      })
      .map((field) => field.label),
  );

  const credentialMissingFields = computed(() =>
    selectedAdapter.value.definition.credentialFields
      .filter((field) => field.required)
      .filter((field) => {
        const value = credentialConfig[field.key];
        return value === null || value === "";
      })
      .map((field) => field.label),
  );

  const canUpload = computed(
    () =>
      validationErrors.value.length === 0 &&
      targetMissingFields.value.length === 0 &&
      credentialMissingFields.value.length === 0,
  );

  const payloadPreview = computed(() => {
    if (!canUpload.value) {
      return null;
    }

    try {
      return selectedAdapter.value.toPlatformQuestion(
        problem,
        targetConfig as never,
      );
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : String(error),
      };
    }
  });

  async function uploadCurrentProblem(): Promise<RuntimeUploadResult> {
    if (!canUpload.value) {
      throw new Error("请先修正校验错误、目标配置和凭证");
    }

    const question = selectedAdapter.value.toPlatformQuestion(
      problem,
      targetConfig as never,
    );

    uploading.value = true;
    try {
      return await uploadProblemViaRuntime({
        adapterId: selectedAdapter.value.definition.id,
        question: structuredClone(question),
        credentials: structuredClone(toRaw(credentialConfig)),
      });
    } finally {
      uploading.value = false;
    }
  }

  function applyCaux8Session(
    session: Caux8SessionInfo,
    moodleSession: string,
    section?: Caux8CourseSection,
  ) {
    selectedAdapterId.value = "caux8-http";
    targetConfig.course = session.courseId;
    targetConfig.sesskey = session.sesskey;
    credentialConfig.moodleSession = moodleSession;

    if (section) {
      targetConfig.section = section.section;
    }
  }

  return {
    adapterOptions,
    selectedAdapterId,
    selectedAdapter,
    problem,
    targetConfig,
    credentialConfig,
    validationErrors,
    validationErrorMap,
    targetMissingFields,
    credentialMissingFields,
    payloadPreview,
    uploading,
    canUpload,
    getFieldOverride,
    uploadCurrentProblem,
    applyCaux8Session,
  };
}
