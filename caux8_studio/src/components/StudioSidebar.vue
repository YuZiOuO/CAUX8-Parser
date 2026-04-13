<script setup lang="ts">
import { computed } from "vue";
import {
  NAlert,
  NButton,
  NCode,
  NDivider,
  NForm,
  NFormItem,
  NInput,
  NInputNumber,
  NLayout,
  NSpace,
  NSelect,
  NTabPane,
  NTabs,
} from "naive-ui";
import type { QuestionAdapterCatalogEntry } from "@/x8req/adapters/catalog.js";
import type { DynamicFormState, PrimitiveFormValue } from "@/studio/types";
import type { RuntimeCommandErrorInfo } from "@/runtime/errors";
import type { Problem } from "@/x8req/core/problem.js";

const props = defineProps<{
  selectedAdapter: QuestionAdapterCatalogEntry<any, any>;
  targetConfig: DynamicFormState;
  credentialConfig: DynamicFormState;
  validationErrors: string[];
  targetMissingFields: string[];
  credentialMissingFields: string[];
  submissionPreview: unknown;
  xmlPreview: string | null;
  problem: Problem;
  uploading: boolean;
  uploadError: RuntimeCommandErrorInfo | null;
}>();

const emit = defineEmits<{
  submit: [];
  exportXml: [];
}>();

function stringify(value: unknown) {
  return JSON.stringify(value, null, 2);
}

function stringifyUploadError(error: RuntimeCommandErrorInfo) {
  return stringify({
    code: error.code,
    status: error.status,
    message: error.message,
    detail: error.detail,
    raw: error.raw,
  });
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

const canSubmit = computed(
  () =>
    props.selectedAdapter.definition.action === "upload" &&
    props.validationErrors.length === 0 &&
    props.targetMissingFields.length === 0 &&
    props.credentialMissingFields.length === 0,
);

const canExportXml = computed(
  () =>
    props.selectedAdapter.definition.action === "export-xml" &&
    props.xmlPreview !== null &&
    props.validationErrors.length === 0 &&
    props.targetMissingFields.length === 0 &&
    props.credentialMissingFields.length === 0,
);
</script>

<template>
  <n-layout native-scrollbar style="height: 100%; padding-left: 8px">
    <n-space vertical>
      <n-alert type="info" :show-icon="true">
        <template v-if="selectedAdapter.definition.action === 'upload'">
          上传默认通过 Tauri command 执行，前端只负责编辑与适配。
        </template>
        <template v-else>
          当前 adapter 只负责导出 Moodle XML，不会直接请求平台。
        </template>
      </n-alert>

      <n-button
        v-if="selectedAdapter.definition.action === 'upload'"
        type="primary"
        block
        :disabled="!canSubmit"
        :loading="uploading"
        @click="emit('submit')"
      >
        一键上传
      </n-button>

      <n-button
        v-else-if="selectedAdapter.definition.action === 'export-xml'"
        type="primary"
        block
        :disabled="!canExportXml"
        @click="emit('exportXml')"
      >
        导出 XML
      </n-button>

      <n-alert
        v-if="uploadError && selectedAdapter.definition.action === 'upload'"
        type="error"
        title="上传失败"
        :show-icon="true"
      >
        {{ uploadError.message }}
      </n-alert>
    </n-space>

    <n-tabs type="line" size="small" animated>
      <n-tab-pane name="config" tab="Target Config">
        <n-form label-placement="top" size="small">
          <n-divider title-placement="left">Adapter Settings</n-divider>
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

          <n-divider title-placement="left">Credentials</n-divider>
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

          <n-alert
            v-for="fieldLabel in credentialMissingFields"
            :key="fieldLabel"
            type="warning"
            :show-icon="true"
          >
            缺少凭证字段：{{ fieldLabel }}
          </n-alert>

          <template v-if="selectedAdapter.definition.action === 'upload'">
            <n-divider title-placement="left">Submission Preview</n-divider>
            <n-code
              :code="stringify(submissionPreview)"
              language="json"
              style="
                max-height: 200px;
                overflow: auto;
                border: 1px solid var(--n-border-color);
                border-radius: 4px;
                padding: 8px;
              "
            />
          </template>

          <template
            v-if="
              selectedAdapter.definition.action === 'export-xml' &&
              xmlPreview
            "
          >
            <n-divider title-placement="left">XML Preview</n-divider>
            <n-code
              :code="xmlPreview"
              language="xml"
              style="
                max-height: 240px;
                overflow: auto;
                border: 1px solid var(--n-border-color);
                border-radius: 4px;
                padding: 8px;
              "
            />
          </template>

          <template
            v-if="uploadError && selectedAdapter.definition.action === 'upload'"
          >
            <n-divider title-placement="left">Upload Error Details</n-divider>
            <n-code
              :code="stringifyUploadError(uploadError)"
              language="json"
              style="
                max-height: 240px;
                overflow: auto;
                border: 1px solid var(--n-border-color);
                border-radius: 4px;
                padding: 8px;
              "
            />
          </template>

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
