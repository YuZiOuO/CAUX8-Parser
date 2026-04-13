<script setup lang="ts">
import {
  NCard,
  NDynamicInput,
  NForm,
  NFormItem,
  NGrid,
  NGridItem,
  NInput,
  NInputNumber,
  NSelect,
  NSpace,
  NSwitch,
  NTabPane,
  NTabs,
  NText,
} from "naive-ui";
import type { Problem, ProblemTestCase } from "@/x8req/core/problem.js";
import type { ProblemFieldOverride } from "@/x8req/adapters/types.js";

const props = defineProps<{
  problem: Problem;
  validationErrorMap: Record<string, string>;
  getFieldOverride: (path: string) => ProblemFieldOverride | null;
}>();

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

function updateBoolean(
  section: "compileOnly" | "isExample" | "stopOnFailure",
  checked: boolean,
  index?: number,
) {
  if (section === "compileOnly") {
    props.problem.execution ??= {};
    props.problem.execution.compileOnly = checked;
    return;
  }

  if (index === undefined) {
    return;
  }

  const testCase = props.problem.testCases[index];
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
  <n-card>
    <n-tabs type="line" size="small" animated>
      <n-tab-pane name="problem" tab="Problem Basics">
        <n-form label-placement="top" size="small">
          <n-grid :cols="24" :x-gap="16">
            <n-grid-item :span="24" :m-span="12">
              <n-form-item>
                <template #label>
                  题目名称
                  <n-text depth="3" style="font-size: 12px; margin-left: 6px">
                    title
                  </n-text>
                </template>
                <n-input v-model:value="problem.title" />
              </n-form-item>
            </n-grid-item>

            <n-grid-item :span="24" :m-span="12">
              <n-form-item>
                <template #label>
                  外部ID
                  <n-text depth="3" style="font-size: 12px; margin-left: 6px">
                    externalId
                  </n-text>
                </template>
                <n-input v-model:value="problem.metadata!.externalId" />
              </n-form-item>
            </n-grid-item>

            <n-grid-item :span="24">
              <n-form-item>
                <template #label>
                  题目描述
                  <n-text depth="3" style="font-size: 12px; margin-left: 6px">
                    statement
                  </n-text>
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
                  <n-text depth="3" style="font-size: 12px; margin-left: 6px">
                    generalFeedback
                  </n-text>
                </template>
                <n-input
                  v-model:value="problem.generalFeedback!.text"
                  type="textarea"
                  :autosize="{ minRows: 2, maxRows: 4 }"
                />
              </n-form-item>
            </n-grid-item>

            <n-grid-item :span="24">
              <n-form-item>
                <template #label>
                  题库标签
                  <n-text depth="3" style="font-size: 12px; margin-left: 6px">
                    tags
                  </n-text>
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
                  <n-text depth="3" style="font-size: 12px; margin-left: 6px">
                    language
                  </n-text>
                </template>
                <n-select
                  v-if="getFieldOverride('execution.language')"
                  v-model:value="problem.execution!.language"
                  :options="(getFieldOverride('execution.language')?.options ?? []) as never"
                />
                <n-input v-else v-model:value="problem.execution!.language" />
              </n-form-item>
            </n-grid-item>

            <n-grid-item :span="24" :m-span="12">
              <n-form-item>
                <template #label>
                  仅编译
                  <n-text depth="3" style="font-size: 12px; margin-left: 6px">
                    compileOnly
                  </n-text>
                </template>
                <n-switch
                  :value="problem.execution?.compileOnly ?? false"
                  @update:value="updateBoolean('compileOnly', $event)"
                />
              </n-form-item>
            </n-grid-item>

            <n-grid-item :span="24" :m-span="8">
              <n-form-item label="Time Limit (s)">
                <n-select
                  v-if="getFieldOverride('limits.timeLimitSeconds')"
                  v-model:value="problem.limits!.timeLimitSeconds"
                  :options="(getFieldOverride('limits.timeLimitSeconds')?.options ?? []) as never"
                  style="width: 100%"
                />
                <n-input-number
                  v-else
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
                  <n-text depth="3" style="font-size: 12px; margin-left: 6px">
                    totalGrade
                  </n-text>
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
                  <n-text depth="3" style="font-size: 12px; margin-left: 6px">
                    presentationErrorRatio
                  </n-text>
                </template>
                <n-input-number
                  v-model:value="problem.grading!.presentationErrorRatio"
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
            <n-card :title="`Case ${index + 1}`" size="small" style="margin-bottom: 8px">
              <n-form label-placement="top" size="small">
                <n-grid :cols="24" :x-gap="16">
                  <n-grid-item :span="24" :m-span="12">
                    <n-form-item
                      :validation-status="validationErrorMap[`testCases[${index}].input`] ? 'error' : undefined"
                      :feedback="validationErrorMap[`testCases[${index}].input`]"
                    >
                      <template #label>
                        输入
                        <n-text depth="3" style="font-size: 12px; margin-left: 6px">
                          input
                        </n-text>
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
                      :validation-status="validationErrorMap[`testCases[${index}].output`] ? 'error' : undefined"
                      :feedback="validationErrorMap[`testCases[${index}].output`]"
                    >
                      <template #label>
                        输出
                        <n-text depth="3" style="font-size: 12px; margin-left: 6px">
                          output
                        </n-text>
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
                      :validation-status="validationErrorMap[`testCases[${index}].feedback`] ? 'error' : undefined"
                      :feedback="validationErrorMap[`testCases[${index}].feedback`]"
                    >
                      <template #label>
                        反馈
                        <n-text depth="3" style="font-size: 12px; margin-left: 6px">
                          feedback
                        </n-text>
                      </template>
                      <n-input v-model:value="value.feedback" />
                    </n-form-item>
                  </n-grid-item>

                  <n-grid-item :span="24" :m-span="6">
                    <n-form-item
                      :validation-status="validationErrorMap[`testCases[${index}].weight`] ? 'error' : undefined"
                      :feedback="validationErrorMap[`testCases[${index}].weight`]"
                    >
                      <template #label>
                        计分权重
                        <n-text depth="3" style="font-size: 12px; margin-left: 6px">
                          weight
                        </n-text>
                      </template>
                      <n-select
                        v-if="getFieldOverride(`testCases[${index}].weight`)"
                        v-model:value="value.weight"
                        :options="(getFieldOverride(`testCases[${index}].weight`)?.options ?? []) as never"
                        style="width: 100%"
                      />
                      <n-input-number
                        v-else
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
                      :validation-status="validationErrorMap[`testCases[${index}].kind`] ? 'error' : undefined"
                      :feedback="validationErrorMap[`testCases[${index}].kind`]"
                    >
                      <template #label>
                        种类
                        <n-text depth="3" style="font-size: 12px; margin-left: 6px">
                          kind
                        </n-text>
                      </template>
                      <n-select v-model:value="value.kind" :options="testcaseKindOptions" />
                    </n-form-item>
                  </n-grid-item>

                  <n-grid-item :span="24" :m-span="6">
                    <n-form-item
                      :validation-status="validationErrorMap[`testCases[${index}].visibility`] ? 'error' : undefined"
                      :feedback="validationErrorMap[`testCases[${index}].visibility`]"
                    >
                      <template #label>
                        可见性
                        <n-text depth="3" style="font-size: 12px; margin-left: 6px">
                          visibility
                        </n-text>
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
                        @update:value="updateBoolean('isExample', $event, index)"
                      >
                        <template #checked>Example</template>
                        <template #unchecked>Example</template>
                      </n-switch>
                      <n-switch
                        :value="value.stopOnFailure ?? false"
                        @update:value="updateBoolean('stopOnFailure', $event, index)"
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
  </n-card>
</template>
