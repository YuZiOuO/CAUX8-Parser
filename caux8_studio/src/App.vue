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
  NInput,
  NInputNumber,
  NLayout,
  NLayoutContent,
  NLayoutHeader,
  NPageHeader,
  NSelect,
  NSpace,
  NSwitch,
  NTag,
  NText,
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
      (entry) => entry.definition.id === selectedAdapterId.value
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
    ])
  );
  const nextCredentials = Object.fromEntries(
    adapter.definition.credentialFields.map((field) => [field.key, null])
  );

  resetFormState(targetConfig, nextTarget);
  resetFormState(credentialConfig, nextCredentials);
}

watch(selectedAdapterId, initializeDynamicState, { immediate: true });

const validationErrors = computed(() => selectedAdapter.value.validate(problem));

const targetMissingFields = computed(() =>
  selectedAdapter.value.definition.targetFields
    .filter((field) => field.required)
    .filter((field) => {
      const value = targetConfig[field.key];
      return value === null || value === "";
    })
    .map((field) => field.label)
);

const payloadPreview = computed(() => {
  if (validationErrors.value.length > 0 || targetMissingFields.value.length > 0) {
    return null;
  }

  try {
    return selectedAdapter.value.toPlatformQuestion(
      problem,
      targetConfig as never
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
  value: PrimitiveFormValue
) {
  state[key] = value;
}

function getFieldOptions(field: { options?: { label: string; value: string | number }[] }) {
  return (field.options ?? []) as never;
}

function updateBoolean(
  section: "compileOnly" | "isExample" | "stopOnFailure",
  checked: boolean,
  index?: number
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
      <n-layout-header bordered>
        <n-page-header title="CAUX8 Studio" subtitle="Problem Adapter Prototype">
          <template #extra>
            <n-space>
              <n-tag type="info" size="small">Naive UI Only</n-tag>
              <n-tag type="success" size="small">Tauri Ready</n-tag>
            </n-space>
          </template>
        </n-page-header>
      </n-layout-header>

      <n-layout-content content-style="padding: 24px;">
        <n-space vertical size="large">
          <n-card>
            <n-grid :cols="24" :x-gap="16" :y-gap="16" responsive="screen">
              <n-grid-item :span="24">
                <n-form label-placement="top">
                  <n-form-item label="Target Adapter">
                    <n-select
                      v-model:value="selectedAdapterId"
                      :options="adapterOptions"
                    />
                  </n-form-item>
                </n-form>
              </n-grid-item>

              <n-grid-item :span="24">
                <n-alert type="info" :show-icon="false">
                  {{ selectedAdapter.definition.description }}
                </n-alert>
              </n-grid-item>
            </n-grid>
          </n-card>

          <n-grid :cols="24" :x-gap="16" :y-gap="16" responsive="screen">
            <n-grid-item :span="24" :m-span="24" :l-span="14">
              <n-space vertical size="large">
                <n-card title="Problem">
                  <n-form label-placement="top">
                    <n-grid :cols="24" :x-gap="16">
                      <n-grid-item :span="24" :m-span="12">
                        <n-form-item label="Title">
                          <n-input v-model:value="problem.title" />
                        </n-form-item>
                      </n-grid-item>

                      <n-grid-item :span="24" :m-span="12">
                        <n-form-item label="External ID">
                          <n-input v-model:value="problem.metadata!.externalId" />
                        </n-form-item>
                      </n-grid-item>

                      <n-grid-item :span="24">
                        <n-form-item label="Statement">
                          <n-input
                            v-model:value="problem.statement.text"
                            type="textarea"
                            :autosize="{ minRows: 6, maxRows: 12 }"
                          />
                        </n-form-item>
                      </n-grid-item>

                      <n-grid-item :span="24">
                        <n-form-item label="General Feedback">
                          <n-input
                            v-model:value="problem.generalFeedback!.text"
                            type="textarea"
                            :autosize="{ minRows: 3, maxRows: 8 }"
                          />
                        </n-form-item>
                      </n-grid-item>
                    </n-grid>
                  </n-form>
                </n-card>

                <n-card title="Execution & Grading">
                  <n-form label-placement="top">
                    <n-grid :cols="24" :x-gap="16">
                      <n-grid-item :span="24" :m-span="12">
                        <n-form-item label="Language">
                          <n-input v-model:value="problem.execution!.language" />
                        </n-form-item>
                      </n-grid-item>

                      <n-grid-item :span="24" :m-span="12">
                        <n-form-item label="Compile Only">
                          <n-switch
                            :value="problem.execution?.compileOnly ?? false"
                            @update:value="updateBoolean('compileOnly', $event)"
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
                        <n-form-item label="Memory Limit (bytes)">
                          <n-input-number
                            v-model:value="problem.limits!.memoryLimitBytes"
                            :min="0"
                            style="width: 100%"
                          />
                        </n-form-item>
                      </n-grid-item>

                      <n-grid-item :span="24" :m-span="8">
                        <n-form-item label="Total Grade">
                          <n-input-number
                            v-model:value="problem.grading!.totalGrade"
                            :min="0"
                            style="width: 100%"
                          />
                        </n-form-item>
                      </n-grid-item>

                      <n-grid-item :span="24" :m-span="12">
                        <n-form-item label="Presentation Error Ratio">
                          <n-input-number
                            v-model:value="problem.grading!.presentationErrorRatio"
                            :min="0"
                            :max="1"
                            :step="0.1"
                            style="width: 100%"
                          />
                        </n-form-item>
                      </n-grid-item>

                      <n-grid-item :span="24" :m-span="12">
                        <n-form-item label="Tags">
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
                </n-card>

                <n-card title="Test Cases">
                  <n-dynamic-input
                    v-model:value="problem.testCases"
                    :on-create="createTestCase"
                    show-sort-button
                  >
                    <template #default="{ value, index }">
                      <n-card :title="`Case ${index + 1}`" size="small">
                        <n-form label-placement="top">
                          <n-grid :cols="24" :x-gap="16">
                            <n-grid-item :span="24" :m-span="12">
                              <n-form-item label="Input">
                                <n-input
                                  v-model:value="value.input"
                                  type="textarea"
                                  :autosize="{ minRows: 3, maxRows: 6 }"
                                />
                              </n-form-item>
                            </n-grid-item>

                            <n-grid-item :span="24" :m-span="12">
                              <n-form-item label="Output">
                                <n-input
                                  v-model:value="value.output"
                                  type="textarea"
                                  :autosize="{ minRows: 3, maxRows: 6 }"
                                />
                              </n-form-item>
                            </n-grid-item>

                            <n-grid-item :span="24">
                              <n-form-item label="Feedback">
                                <n-input v-model:value="value.feedback" />
                              </n-form-item>
                            </n-grid-item>

                            <n-grid-item :span="24" :m-span="6">
                              <n-form-item label="Weight">
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
                              <n-form-item label="Kind">
                                <n-select
                                  v-model:value="value.kind"
                                  :options="testcaseKindOptions"
                                />
                              </n-form-item>
                            </n-grid-item>

                            <n-grid-item :span="24" :m-span="6">
                              <n-form-item label="Visibility">
                                <n-select
                                  v-model:value="value.visibility"
                                  :options="testcaseVisibilityOptions"
                                />
                              </n-form-item>
                            </n-grid-item>

                            <n-grid-item :span="12" :m-span="3">
                              <n-form-item label="Example">
                                <n-switch
                                  :value="value.isExample ?? false"
                                  @update:value="
                                    updateBoolean('isExample', $event, index)
                                  "
                                />
                              </n-form-item>
                            </n-grid-item>

                            <n-grid-item :span="12" :m-span="3">
                              <n-form-item label="Stop On Failure">
                                <n-switch
                                  :value="value.stopOnFailure ?? false"
                                  @update:value="
                                    updateBoolean('stopOnFailure', $event, index)
                                  "
                                />
                              </n-form-item>
                            </n-grid-item>
                          </n-grid>
                        </n-form>
                      </n-card>
                    </template>
                  </n-dynamic-input>
                </n-card>
              </n-space>
            </n-grid-item>

            <n-grid-item :span="24" :m-span="24" :l-span="10">
              <n-space vertical size="large">
                <n-card title="Target Config">
                  <n-form label-placement="top">
                    <n-form-item
                      v-for="field in selectedAdapter.definition.targetFields"
                      :key="field.key"
                      :label="field.label"
                    >
                      <n-select
                        v-if="field.input === 'select'"
                        :value="targetConfig[field.key]"
                        :options="getFieldOptions(field)"
                        @update:value="setFieldValue(targetConfig, field.key, $event)"
                      />
                      <n-input-number
                        v-else-if="field.input === 'number'"
                        :value="getNumberValue(targetConfig, field.key)"
                        style="width: 100%"
                        @update:value="setFieldValue(targetConfig, field.key, $event)"
                      />
                      <n-input
                        v-else
                        :value="getTextValue(targetConfig, field.key)"
                        :type="field.input === 'password' ? 'password' : 'text'"
                        @update:value="setFieldValue(targetConfig, field.key, $event)"
                      />
                    </n-form-item>
                  </n-form>
                </n-card>

                <n-card title="Credentials">
                  <n-form label-placement="top">
                    <n-form-item
                      v-for="field in selectedAdapter.definition.credentialFields"
                      :key="field.key"
                      :label="field.label"
                    >
                      <n-input
                        :value="getTextValue(credentialConfig, field.key)"
                        :type="field.input === 'password' ? 'password' : 'text'"
                        @update:value="setFieldValue(credentialConfig, field.key, $event)"
                      />
                    </n-form-item>
                  </n-form>
                </n-card>

                <n-card title="Validation">
                  <n-space vertical>
                    <n-alert
                      v-if="validationErrors.length === 0"
                      type="success"
                      :show-icon="false"
                    >
                      通用题目字段校验通过
                    </n-alert>

                    <n-alert
                      v-for="error in validationErrors"
                      :key="error"
                      type="error"
                      :show-icon="false"
                    >
                      {{ error }}
                    </n-alert>

                    <n-alert
                      v-for="fieldLabel in targetMissingFields"
                      :key="fieldLabel"
                      type="warning"
                      :show-icon="false"
                    >
                      缺少目标平台字段：{{ fieldLabel }}
                    </n-alert>
                  </n-space>
                </n-card>

                <n-card title="Preview">
                  <n-space vertical>
                    <div>
                      <n-text depth="3">Platform Payload</n-text>
                      <n-divider style="margin-top: 8px; margin-bottom: 12px" />
                      <n-code :code="stringify(payloadPreview)" language="json" />
                    </div>

                    <div>
                      <n-text depth="3">Raw Problem</n-text>
                      <n-divider style="margin-top: 8px; margin-bottom: 12px" />
                      <n-code :code="stringify(problem)" language="json" />
                    </div>

                    <div>
                      <n-text depth="3">Credentials Draft</n-text>
                      <n-divider style="margin-top: 8px; margin-bottom: 12px" />
                      <n-code :code="stringify(credentialConfig)" language="json" />
                    </div>
                  </n-space>
                </n-card>

                <n-card title="Next Step">
                  <n-space vertical>
                    <n-text depth="3">
                      当前页面只做 adapter 适配验证和 payload 预览。
                    </n-text>
                    <n-button type="primary" secondary disabled>
                      Upload via Tauri Command
                    </n-button>
                  </n-space>
                </n-card>
              </n-space>
            </n-grid-item>
          </n-grid>
        </n-space>
      </n-layout-content>
    </n-layout>
  </n-config-provider>
</template>
