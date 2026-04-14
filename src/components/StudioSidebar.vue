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
  NCard,
  NCollapse,
  NCollapseItem,
  NBadge,
  NTag,
  NScrollbar,
} from "naive-ui";
import type { QuestionAdapterCatalogEntry } from "@/problem/adapters/catalog.js";
import type { DynamicFormState, PrimitiveFormValue } from "@/studio/types";
import type { RuntimeCommandErrorInfo } from "@/runtime/errors";
import type { Problem } from "@/problem/model/problem.js";

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
  <n-card title="发布设置与执行" size="small" :bordered="false">
    <n-space vertical>
      <n-text
        v-if="selectedAdapter.definition.action !== 'upload'"
        depth="3"
        style="display: block; font-size: 12px; margin-bottom: 8px;"
      >
        提示：该模式只负责离线导出文件或预览，不会有任何上云网络请求。
      </n-text>

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
        :show-icon="false"
      >
        {{ uploadError.message }}
      </n-alert>
    </n-space>

    <n-divider />

      <n-collapse :default-expanded-names="['config']">
        <n-collapse-item name="config" title="基础设置与凭证">
          <template #header-extra>
            <n-tag
              v-if="targetMissingFields.length > 0 || credentialMissingFields.length > 0"
              type="error"
              size="small"
              round
            >
              配置未完善
            </n-tag>
            <n-tag
              v-else
              type="success"
              size="small"
              round
            >
              配置就绪
            </n-tag>
          </template>
          <n-form label-placement="top" size="small" :show-feedback="false">
            <!-- 适配器设置和凭证区 -->
            <n-divider title-placement="left" style="margin-top: 0;">适配器设置</n-divider>
          <n-form-item
            v-for="field in selectedAdapter.definition.targetFields"
            :key="field.key"
            :label="field.label"
            style="margin-bottom: 12px;"
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
              :disabled="field.disabled"
              @update:value="setFieldValue(targetConfig, field.key, $event)"
              :placeholder="field.placeholder"
            />
            <n-input
              v-else
              :value="getTextValue(targetConfig, field.key)"
              :type="field.input === 'password' ? 'password' : 'text'"
              :disabled="field.disabled"
              @update:value="setFieldValue(targetConfig, field.key, $event)"
              :placeholder="field.placeholder"
            />
          </n-form-item>

          <n-divider title-placement="left">凭证 (Session与凭据)</n-divider>
          <n-form-item
            v-for="field in selectedAdapter.definition.credentialFields"
            :key="field.key"
            :label="field.label"
          >
            <n-input
              :value="getTextValue(credentialConfig, field.key)"
              :type="field.input === 'password' ? 'password' : 'text'"
              :disabled="field.disabled"
              @update:value="setFieldValue(credentialConfig, field.key, $event)"
              :placeholder="field.placeholder"
            />
          </n-form-item>
        </n-form>
      </n-collapse-item>

      <n-collapse-item name="validation" title="校验与预览日志">
        <template #header-extra>
          <n-tag
            v-if="validationErrors.length > 0 || targetMissingFields.length > 0 || credentialMissingFields.length > 0"
            type="error"
            size="small"
            round
          >
            有校验或必填项缺失
          </n-tag>
          <n-tag
            v-else
            type="success"
            size="small"
            round
          >
            校验通过
          </n-tag>
        </template>
        <n-space vertical size="small">
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

          <n-alert
            v-for="fieldLabel in credentialMissingFields"
            :key="fieldLabel"
            type="warning"
            :show-icon="false"
          >
            缺少凭证字段：{{ fieldLabel }}
          </n-alert>

          <template v-if="selectedAdapter.definition.action === 'upload'">
            <n-divider title-placement="left">提交预览</n-divider>
            <n-card
              embedded
              size="small"
              content-style="padding: 0;"
              :bordered="false"
            >
              <n-scrollbar style="max-height: 200px;">
                <div style="padding: 12px;">
                  <n-code
                    :code="stringify(submissionPreview)"
                    language="json"
                    word-wrap
                  />
                </div>
              </n-scrollbar>
            </n-card>
          </template>

          <template
            v-if="
              selectedAdapter.definition.action === 'export-xml' &&
              xmlPreview
            "
          >
            <n-divider title-placement="left">XML 预览</n-divider>
            <n-card
              embedded
              size="small"
              content-style="padding: 0;"
              :bordered="false"
            >
              <n-scrollbar style="max-height: 240px;" x-scrollable>
                <div style="padding: 12px;">
                  <n-code
                    :code="xmlPreview"
                    language="xml"
                    word-wrap
                  />
                </div>
              </n-scrollbar>
            </n-card>
          </template>

          <template
            v-if="uploadError && selectedAdapter.definition.action === 'upload'"
          >
            <n-divider title-placement="left">上传错误详情</n-divider>
            <n-card
              embedded
              size="small"
              content-style="padding: 0;"
              :bordered="false"
            >
              <n-scrollbar style="max-height: 240px;">
                <div style="padding: 12px;">
                  <n-code
                    :code="stringifyUploadError(uploadError)"
                    language="json"
                    word-wrap
                  />
                </div>
              </n-scrollbar>
            </n-card>
          </template>

          <n-divider title-placement="left">原始题目数据</n-divider>
          <n-card
            embedded
            size="small"
            content-style="padding: 0;"
            :bordered="false"
          >
            <n-scrollbar style="max-height: 200px;">
              <div style="padding: 12px;">
                <n-code
                  :code="stringify(problem)"
                  language="json"
                  word-wrap
                />
              </div>
            </n-scrollbar>
          </n-card>
        </n-space>
      </n-collapse-item>
    </n-collapse>
  </n-card>
</template>
