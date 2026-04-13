<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import {
  NAlert,
  NButton,
  NCard,
  NCode,
  NConfigProvider,
  NDivider,
  NDynamicInput,
  NForm,
  NFormItem,
  NGlobalStyle,
  NGrid,
  NGridItem,
  NIcon,
  NInput,
  NInputNumber,
  NLayout,
  NLayoutContent,
  NLayoutHeader,
  NPageHeader,
  NSelect,
  NSpace,
  NSplit,
  NSwitch,
  NTabs,
  NTabPane,
  NTag,
  NText,
  NTooltip,
} from "naive-ui";
import { questionAdapterCatalog } from "@/x8req/adapters/catalog.js";
import type { Problem, ProblemTestCase } from "@/x8req/core/problem.js";

type PrimitiveFormValue = string | number | null;
type DynamicFormState = Record<string, PrimitiveFormValue>;

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

const problem = reactive<Problem>({
  title: "A + B",
  statement: {
    text: "<p>输入两个整数，输出它们的和。</p>",
    format: "html",
  },
  generalFeedback: {
    text: "<p>注意处理换行。</p>",
    format: "html",
  },
  testCases: [
    {
      input: "1 2\n",
      output: "3\n",
      feedback: "",
      weight: 1.0,
      isExample: true,
      stopOnFailure: false,
      visibility: "show",
      kind: "normal",
    },
  ],
  execution: {
    language: "1111_ideone",
    compileOnly: false,
    preamble: "",
    postamble: "",
    forbiddenWords: "",
  },
  limits: {
    timeLimitSeconds: 2,
    memoryLimitBytes: 67108864,
  },
  grading: {
    totalGrade: 100,
    presentationErrorRatio: 1.0,
  },
  metadata: {
    externalId: "demo-ab",
    tags: ["demo", "math"],
  },
});

const targetConfig = reactive<DynamicFormState>({});
const credentialConfig = reactive<DynamicFormState>({});

function resetFormState(target: DynamicFormState, next: DynamicFormState) {
  for (const key of Object.keys(target)) {
    delete target[key];
  }

  Object.assign(target, next);
}

function initializeDynamicState() {
  const adapter = selectedAdapter.value;
  const nextTarget = Object.fromEntries(
    adapter.definition.targetFields.map((field) => [
      field.key,
      (field.defaultValue ?? null) as PrimitiveFormValue,
    ]),
  );
  const nextCredentials = Object.fromEntries(
    adapter.definition.credentialFields.map((field) => [field.key, null]),
  );

  resetFormState(targetConfig, nextTarget);
  resetFormState(credentialConfig, nextCredentials);
}

watch(selectedAdapterId, initializeDynamicState, { immediate: true });

const validationErrors = computed(() =>
  selectedAdapter.value.validate(problem),
);

// 将验证错误列表解析为以字段路径为 key 的对象，方便对齐到具体表单项
const validationErrorMap = computed(() => {
  const map: Record<string, string> = {};
  for (const err of validationErrors.value) {
    // 简单提取可能的路径（例如："testCases[0].weight xxxx" 提取为 "testCases[0].weight"）
    const match = err.match(/^([\w\[\].]+)/);
    if (match) {
      map[match[1]] = err;
    }
  }
  return map;
});

const targetMissingFields = computed(() =>
  selectedAdapter.value.definition.targetFields
    .filter((field) => field.required)
    .filter((field) => {
      const value = targetConfig[field.key];
      return value === null || value === "";
    })
    .map((field) => field.label),
);

const payloadPreview = computed(() => {
  if (
    validationErrors.value.length > 0 ||
    targetMissingFields.value.length > 0
  ) {
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

const testcaseKindOptions = [
  { label: "Normal", value: "normal" },
  { label: "Precheck", value: "precheck" },
  { label: "Both", value: "both" },
];

const testcaseVisibilityOptions = [
  { label: "Show", value: "show" },
  { label: "Hide", value: "hide" },
];

function createTestCase(): ProblemTestCase {
  return {
    input: "",
    output: "",
    feedback: "",
    weight: 1.0,
    isExample: false,
    stopOnFailure: false,
    visibility: "show",
    kind: "normal",
  };
}

function stringify(value: unknown) {
  return JSON.stringify(value, null, 2);
}

function getTextValue(state: DynamicFormState, key: string): string {
  const value = state[key];
  if (value === null) {
    return "";
  }

  return String(value);
}

function getNumberValue(state: DynamicFormState, key: string): number | null {
  const value = state[key];
  if (typeof value === "number") {
    return value;
  }

  if (value === null || value === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function setFieldValue(
  state: DynamicFormState,
  key: string,
  value: PrimitiveFormValue,
) {
  state[key] = value;
}

function getFieldOptions(field: {
  options?: { label: string; value: string | number }[];
}) {
  return (field.options ?? []) as never;
}

function updateBoolean(
  section: "compileOnly" | "isExample" | "stopOnFailure",
  checked: boolean,
  index?: number,
) {
  if (section === "compileOnly") {
    problem.execution ??= {};
    problem.execution.compileOnly = checked;
    return;
  }

  if (index === undefined) {
    return;
  }

  const testCase = problem.testCases[index];
  if (!testCase) {
    return;
  }

  if (section === "isExample") {
    testCase.isExample = checked;
  }

  if (section === "stopOnFailure") {
    testCase.stopOnFailure = checked;
  }
}
</script>

<template>
  <n-config-provider>
    <n-global-style />
    <n-layout embedded style="min-height: 100vh">
      <n-layout-header bordered style="padding: 16px">
        <n-page-header
          title="CAUX8 Studio"
          subtitle="Problem Adapter Prototype"
        >
          <template #extra>
            <n-space>
              <n-tag type="info" size="small">Naive UI Only</n-tag>
              <n-tag type="success" size="small">Tauri Ready</n-tag>
            </n-space>
          </template>
        </n-page-header>
      </n-layout-header>

      <n-layout-content
        content-style="padding: 16px; height: calc(100vh - 73px); display: flex; flex-direction: column;"
      >
        <n-space vertical size="medium" style="flex: 1">
          <n-form inline size="small">
            <n-form-item label="Target Adapter">
              <n-select
                v-model:value="selectedAdapterId"
                :options="adapterOptions"
                style="width: 300px"
              />
            </n-form-item>
            <n-alert
              v-if="selectedAdapter"
              type="info"
              :show-icon="true"
              style="margin-left: 16px"
            >
              {{ selectedAdapter.definition.description }}
            </n-alert>
          </n-form>

          <n-split
            direction="horizontal"
            style="flex: 1"
            :default-size="0.6"
            :min="0.3"
            :max="0.8"
          >
            <template #1>
              <n-layout
                native-scrollbar
                style="height: 100%; padding-right: 8px"
              >
                <n-tabs type="line" size="small" animated>
                  <n-tab-pane name="problem" tab="Problem Basics">
                    <n-form label-placement="top" size="small">
                      <n-grid :cols="24" :x-gap="16">
                        <n-grid-item :span="24" :m-span="12">
                          <n-form-item>
                            <template #label>
                              题目名称
                              <n-text
                                depth="3"
                                style="font-size: 12px; margin-left: 6px"
                                >title</n-text
                              >
                            </template>
                            <n-input v-model:value="problem.title" />
                          </n-form-item>
                        </n-grid-item>
                        <n-grid-item :span="24" :m-span="12">
                          <n-form-item>
                            <template #label>
                              外部ID
                              <n-text
                                depth="3"
                                style="font-size: 12px; margin-left: 6px"
                                >externalId</n-text
                              >
                            </template>
                            <n-input
                              v-model:value="problem.metadata!.externalId"
                            />
                          </n-form-item>
                        </n-grid-item>

                        <n-grid-item :span="24">
                          <n-form-item>
                            <template #label>
                              题目描述
                              <n-text
                                depth="3"
                                style="font-size: 12px; margin-left: 6px"
                                >statement</n-text
                              >
                            </template>
                            <n-input
                              v-model:value="problem.statement.text"
                              type="textarea"
                              :autosize="{ minRows: 4, maxRows: 8 }"
                            />
                          </n-form-item>
                        </n-grid-item>

                        <n-grid-item :span="24">
                          <n-form-item>
                            <template #label>
                              通用反馈
                              <n-text
                                depth="3"
                                style="font-size: 12px; margin-left: 6px"
                                >generalFeedback</n-text
                              >
                            </template>
                            <n-input
                              v-model:value="problem.generalFeedback!.text"
                              type="textarea"
                              :autosize="{ minRows: 2, maxRows: 4 }"
                            />
                          </n-form-item>
                        </n-grid-item>

                        <n-grid-item :span="24" :m-span="24">
                          <n-form-item>
                            <template #label>
                              题库标签
                              <n-text
                                depth="3"
                                style="font-size: 12px; margin-left: 6px"
                                >tags</n-text
                              >
                            </template>
                            <n-input
                              :value="(problem.metadata?.tags ?? []).join(', ')"
                              @update:value="
                                problem.metadata!.tags = $event
                                  .split(',')
                                  .map((item) => item.trim())
                                  .filter(Boolean)
                              "
                            />
                          </n-form-item>
                        </n-grid-item>
                      </n-grid>
                    </n-form>
                  </n-tab-pane>

                  <n-tab-pane name="execution" tab="Execution & Grading">
                    <n-form label-placement="top" size="small">
                      <n-grid :cols="24" :x-gap="16">
                        <n-grid-item :span="24" :m-span="12">
                          <n-form-item>
                            <template #label>
                              目标语言
                              <n-text
                                depth="3"
                                style="font-size: 12px; margin-left: 6px"
                                >language</n-text
                              >
                            </template>
                            <n-input
                              v-model:value="problem.execution!.language"
                            />
                          </n-form-item>
                        </n-grid-item>

                        <n-grid-item :span="24" :m-span="12">
                          <n-form-item>
                            <template #label>
                              仅编译
                              <n-text
                                depth="3"
                                style="font-size: 12px; margin-left: 6px"
                                >compileOnly</n-text
                              >
                            </template>
                            <n-switch
                              :value="problem.execution?.compileOnly ?? false"
                              @update:value="
                                updateBoolean('compileOnly', $event)
                              "
                            />
                          </n-form-item>
                        </n-grid-item>

                        <n-grid-item :span="24" :m-span="8">
                          <n-form-item label="Time Limit (s)">
                            <n-input-number
                              v-model:value="problem.limits!.timeLimitSeconds"
                              :min="1"
                              :max="10"
                              style="width: 100%"
                            />
                          </n-form-item>
                        </n-grid-item>

                        <n-grid-item :span="24" :m-span="8">
                          <n-form-item label="Memory Limit (B)">
                            <n-input-number
                              v-model:value="problem.limits!.memoryLimitBytes"
                              :min="0"
                              style="width: 100%"
                            />
                          </n-form-item>
                        </n-grid-item>

                        <n-grid-item :span="24" :m-span="8">
                          <n-form-item>
                            <template #label>
                              总分
                              <n-text
                                depth="3"
                                style="font-size: 12px; margin-left: 6px"
                                >totalGrade</n-text
                              >
                            </template>
                            <n-input-number
                              v-model:value="problem.grading!.totalGrade"
                              :min="0"
                              style="width: 100%"
                            />
                          </n-form-item>
                        </n-grid-item>

                        <n-grid-item :span="24" :m-span="12">
                          <n-form-item>
                            <template #label>
                              PE惩罚系数
                              <n-text
                                depth="3"
                                style="font-size: 12px; margin-left: 6px"
                                >presentationErrorRatio</n-text
                              >
                            </template>
                            <n-input-number
                              v-model:value="
                                problem.grading!.presentationErrorRatio
                              "
                              :min="0"
                              :max="1"
                              :step="0.1"
                              style="width: 100%"
                            />
                          </n-form-item>
                        </n-grid-item>
                      </n-grid>
                    </n-form>
                  </n-tab-pane>

                  <n-tab-pane name="testcases" tab="Test Cases">
                    <n-dynamic-input
                      v-model:value="problem.testCases"
                      :on-create="createTestCase"
                      show-sort-button
                    >
                      <template #default="{ value, index }">
                        <n-card
                          :title="`Case ${index + 1}`"
                          size="small"
                          style="margin-bottom: 8px"
                        >
                          <n-form label-placement="top" size="small">
                            <n-grid :cols="24" :x-gap="16">
                              <n-grid-item :span="24" :m-span="12">
                                <n-form-item
                                  :validation-status="
                                    validationErrorMap[
                                      `testCases[${index}].input`
                                    ]
                                      ? 'error'
                                      : undefined
                                  "
                                  :feedback="
                                    validationErrorMap[
                                      `testCases[${index}].input`
                                    ]
                                  "
                                >
                                  <template #label>
                                    输入
                                    <n-text
                                      depth="3"
                                      style="font-size: 12px; margin-left: 6px"
                                      >input</n-text
                                    >
                                  </template>
                                  <n-input
                                    v-model:value="value.input"
                                    type="textarea"
                                    :autosize="{ minRows: 2, maxRows: 6 }"
                                  />
                                </n-form-item>
                              </n-grid-item>
                              <n-grid-item :span="24" :m-span="12">
                                <n-form-item
                                  :validation-status="
                                    validationErrorMap[
                                      `testCases[${index}].output`
                                    ]
                                      ? 'error'
                                      : undefined
                                  "
                                  :feedback="
                                    validationErrorMap[
                                      `testCases[${index}].output`
                                    ]
                                  "
                                >
                                  <template #label>
                                    输出
                                    <n-text
                                      depth="3"
                                      style="font-size: 12px; margin-left: 6px"
                                      >output</n-text
                                    >
                                  </template>
                                  <n-input
                                    v-model:value="value.output"
                                    type="textarea"
                                    :autosize="{ minRows: 2, maxRows: 6 }"
                                  />
                                </n-form-item>
                              </n-grid-item>
                              <n-grid-item :span="24">
                                <n-form-item
                                  :validation-status="
                                    validationErrorMap[
                                      `testCases[${index}].feedback`
                                    ]
                                      ? 'error'
                                      : undefined
                                  "
                                  :feedback="
                                    validationErrorMap[
                                      `testCases[${index}].feedback`
                                    ]
                                  "
                                >
                                  <template #label>
                                    反馈
                                    <n-text
                                      depth="3"
                                      style="font-size: 12px; margin-left: 6px"
                                      >feedback</n-text
                                    >
                                  </template>
                                  <n-input v-model:value="value.feedback" />
                                </n-form-item>
                              </n-grid-item>
                              <n-grid-item :span="24" :m-span="6">
                                <n-form-item
                                  :validation-status="
                                    validationErrorMap[
                                      `testCases[${index}].weight`
                                    ]
                                      ? 'error'
                                      : undefined
                                  "
                                  :feedback="
                                    validationErrorMap[
                                      `testCases[${index}].weight`
                                    ]
                                  "
                                >
                                  <template #label>
                                    计分权重
                                    <n-text
                                      depth="3"
                                      style="font-size: 12px; margin-left: 6px"
                                      >weight</n-text
                                    >
                                  </template>
                                  <n-input-number
                                    v-model:value="value.weight"
                                    :min="0"
                                    :max="1"
                                    :step="0.05"
                                    style="width: 100%"
                                  />
                                </n-form-item>
                              </n-grid-item>
                              <n-grid-item :span="24" :m-span="6">
                                <n-form-item
                                  :validation-status="
                                    validationErrorMap[
                                      `testCases[${index}].kind`
                                    ]
                                      ? 'error'
                                      : undefined
                                  "
                                  :feedback="
                                    validationErrorMap[
                                      `testCases[${index}].kind`
                                    ]
                                  "
                                >
                                  <template #label>
                                    种类
                                    <n-text
                                      depth="3"
                                      style="font-size: 12px; margin-left: 6px"
                                      >kind</n-text
                                    >
                                  </template>
                                  <n-select
                                    v-model:value="value.kind"
                                    :options="testcaseKindOptions"
                                  />
                                </n-form-item>
                              </n-grid-item>
                              <n-grid-item :span="24" :m-span="6">
                                <n-form-item
                                  :validation-status="
                                    validationErrorMap[
                                      `testCases[${index}].visibility`
                                    ]
                                      ? 'error'
                                      : undefined
                                  "
                                  :feedback="
                                    validationErrorMap[
                                      `testCases[${index}].visibility`
                                    ]
                                  "
                                >
                                  <template #label>
                                    可见性
                                    <n-text
                                      depth="3"
                                      style="font-size: 12px; margin-left: 6px"
                                      >visibility</n-text
                                    >
                                  </template>
                                  <n-select
                                    v-model:value="value.visibility"
                                    :options="testcaseVisibilityOptions"
                                  />
                                </n-form-item>
                              </n-grid-item>

                              <n-grid-item :span="24" :m-span="6">
                                <n-space align="center" style="height: 100%">
                                  <n-switch
                                    :value="value.isExample ?? false"
                                    @update:value="
                                      updateBoolean('isExample', $event, index)
                                    "
                                  >
                                    <template #checked>Example</template>
                                    <template #unchecked>Example</template>
                                  </n-switch>
                                  <n-switch
                                    :value="value.stopOnFailure ?? false"
                                    @update:value="
                                      updateBoolean(
                                        'stopOnFailure',
                                        $event,
                                        index,
                                      )
                                    "
                                  >
                                    <template #checked>Stop Fail</template>
                                    <template #unchecked>Stop Fail</template>
                                  </n-switch>
                                </n-space>
                              </n-grid-item>
                            </n-grid>
                          </n-form>
                        </n-card>
                      </template>
                    </n-dynamic-input>
                  </n-tab-pane>
                </n-tabs>
              </n-layout>
            </template>
            <template #2>
              <n-layout
                native-scrollbar
                style="height: 100%; padding-left: 8px"
              >
                <n-tabs type="line" size="small" animated>
                  <n-tab-pane name="config" tab="Target Config">
                    <n-form label-placement="top" size="small">
                      <n-divider title-placement="left"
                        >Adapter Settings</n-divider
                      >
                      <n-form-item
                        v-for="field in selectedAdapter.definition.targetFields"
                        :key="field.key"
                        :label="field.label"
                      >
                        <n-select
                          v-if="field.input === 'select'"
                          :value="targetConfig[field.key]"
                          :options="getFieldOptions(field)"
                          @update:value="
                            setFieldValue(targetConfig, field.key, $event)
                          "
                        />
                        <n-input-number
                          v-else-if="field.input === 'number'"
                          :value="getNumberValue(targetConfig, field.key)"
                          style="width: 100%"
                          @update:value="
                            setFieldValue(targetConfig, field.key, $event)
                          "
                        />
                        <n-input
                          v-else
                          :value="getTextValue(targetConfig, field.key)"
                          :type="
                            field.input === 'password' ? 'password' : 'text'
                          "
                          @update:value="
                            setFieldValue(targetConfig, field.key, $event)
                          "
                        />
                      </n-form-item>

                      <n-divider title-placement="left">Credentials</n-divider>
                      <n-form-item
                        v-for="field in selectedAdapter.definition
                          .credentialFields"
                        :key="field.key"
                        :label="field.label"
                      >
                        <n-input
                          :value="getTextValue(credentialConfig, field.key)"
                          :type="
                            field.input === 'password' ? 'password' : 'text'
                          "
                          @update:value="
                            setFieldValue(credentialConfig, field.key, $event)
                          "
                        />
                      </n-form-item>
                    </n-form>
                  </n-tab-pane>

                  <n-tab-pane name="validation" tab="Validation & Preview">
                    <n-space vertical>
                      <n-alert
                        v-if="validationErrors.length === 0"
                        type="success"
                        :show-icon="true"
                      >
                        通用题目字段校验通过
                      </n-alert>
                      <n-alert
                        v-for="error in validationErrors"
                        :key="error"
                        type="error"
                        :show-icon="true"
                      >
                        {{ error }}
                      </n-alert>
                      <n-alert
                        v-for="fieldLabel in targetMissingFields"
                        :key="fieldLabel"
                        type="warning"
                        :show-icon="true"
                      >
                        缺少目标平台字段：{{ fieldLabel }}
                      </n-alert>

                      <n-divider title-placement="left"
                        >Platform Payload</n-divider
                      >
                      <n-code
                        :code="stringify(payloadPreview)"
                        language="json"
                        style="
                          max-height: 200px;
                          overflow: auto;
                          border: 1px solid var(--n-border-color);
                          border-radius: 4px;
                          padding: 8px;
                        "
                      />

                      <n-divider title-placement="left">Raw Problem</n-divider>
                      <n-code
                        :code="stringify(problem)"
                        language="json"
                        style="
                          max-height: 200px;
                          overflow: auto;
                          border: 1px solid var(--n-border-color);
                          border-radius: 4px;
                          padding: 8px;
                        "
                      />
                    </n-space>
                  </n-tab-pane>
                </n-tabs>
              </n-layout>
            </template>
          </n-split>
        </n-space>
      </n-layout-content>
    </n-layout>
  </n-config-provider>
</template>
