import { computed, reactive, ref, toRaw, watch } from "vue";
import { questionAdapterCatalog } from "@/x8req/adapters/catalog.js";
import type { Problem } from "@/x8req/core/problem.js";
import type { ProblemFieldOverride } from "@/x8req/adapters/types.js";
import type { DynamicFormState, PrimitiveFormValue } from "@/studio/types";
import { createDefaultProblem } from "@/studio/default-problem";
import type {
  Caux8CourseSection,
  Caux8SessionInfo,
} from "@/runtime/session";
import {
  submitProblemViaRuntime,
  type RuntimeSubmitResult,
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

  const problems = ref<Problem[]>([createDefaultProblem()]);
  const activeProblemIndex = ref(0);

  const problem = computed(() => problems.value[activeProblemIndex.value]);

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

  const validationErrors = computed(() => selectedAdapter.value.validate(problem.value));

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

  const canExecute = computed(
    () =>
      validationErrors.value.length === 0 &&
      targetMissingFields.value.length === 0 &&
      credentialMissingFields.value.length === 0,
  );

  const submissionPreview = computed(() => {
    if (
      selectedAdapter.value.definition.action !== "upload" ||
      !selectedAdapter.value.buildSubmission ||
      !canExecute.value
    ) {
      return null;
    }

    try {
      return selectedAdapter.value.buildSubmission(
        problem.value,
        targetConfig as never,
      );
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : String(error),
      };
    }
  });

  const xmlPreview = computed(() => {
    if (
      selectedAdapter.value.definition.action !== "export-xml" ||
      !selectedAdapter.value.exportXml ||
      !canExecute.value
    ) {
      return null;
    }

    try {
      return selectedAdapter.value.exportXml(problem.value, targetConfig as never);
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      return `<!-- XML export failed: ${detail} -->`;
    }
  });

  async function submitCurrentProblem(): Promise<RuntimeSubmitResult> {
    if (
      selectedAdapter.value.definition.action !== "upload" ||
      !selectedAdapter.value.buildSubmission
    ) {
      throw new Error("当前 adapter 不支持上传");
    }

    if (!canExecute.value) {
      throw new Error("请先修正校验错误、目标配置和凭证");
    }

    const question = selectedAdapter.value.buildSubmission(
      problem.value,
      targetConfig as never,
    );

    uploading.value = true;
    try {
      return await submitProblemViaRuntime({
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

  function replaceProblem(nextProblem: Problem) {
    if (problems.value.length === 0) {
      problems.value.push(structuredClone(nextProblem));
      activeProblemIndex.value = 0;
    } else {
      problems.value[activeProblemIndex.value] = structuredClone(nextProblem);
    }
  }

  function appendProblem(nextProblem: Problem) {
    problems.value.push(structuredClone(nextProblem));
    activeProblemIndex.value = problems.value.length - 1;
  }

  function appendBlankProblem() {
    problems.value.push(createDefaultProblem());
    activeProblemIndex.value = problems.value.length - 1;
  }

  function removeProblem(index: number) {
    if (problems.value.length <= 1) {
      // 最后一题不能删除，直接重置
      problems.value[0] = createDefaultProblem();
      return;
    }
    
    problems.value.splice(index, 1);
    if (activeProblemIndex.value >= problems.value.length) {
      activeProblemIndex.value = problems.value.length - 1;
    } else if (activeProblemIndex.value > index) {
      activeProblemIndex.value--;
    }
  }

  return {
    adapterOptions,
    selectedAdapterId,
    selectedAdapter,
    problems,
    activeProblemIndex,
    problem,
    targetConfig,
    credentialConfig,
    validationErrors,
    validationErrorMap,
    targetMissingFields,
    credentialMissingFields,
    submissionPreview,
    xmlPreview,
    uploading,
    canExecute,
    getFieldOverride,
    submitCurrentProblem,
    applyCaux8Session,
    replaceProblem,
    appendProblem,
    appendBlankProblem,
    removeProblem,
  };
}
