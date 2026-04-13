<script setup lang="ts">
import { createDiscreteApi } from "naive-ui";
import {
  NAlert,
  NConfigProvider,
  NForm,
  NGlobalStyle,
  NLayout,
  NLayoutContent,
  NLayoutHeader,
  NPageHeader,
  NSelect,
  NSpace,
  NSplit,
  NTag,
} from "naive-ui";
import ProblemEditorPanel from "@/components/ProblemEditorPanel.vue";
import StudioSidebar from "@/components/StudioSidebar.vue";
import { useStudioState } from "@/studio/use-studio-state";

const {
  adapterOptions,
  selectedAdapterId,
  selectedAdapter,
  problem,
  targetConfig,
  credentialConfig,
  validationErrors,
  validationErrorMap,
  targetMissingFields,
  payloadPreview,
  uploading,
  runtimeLabel,
  runtimeHint,
  getFieldOverride,
  uploadCurrentProblem,
} = useStudioState();

const { message } = createDiscreteApi(["message"]);

async function handleUpload() {
  try {
    const result = await uploadCurrentProblem();

    if (result.ok) {
      message.success(result.message ?? "上传完成");
      return;
    }

    message.error(result.message ?? "上传失败");
  } catch (error) {
    message.error(error instanceof Error ? error.message : String(error));
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
                <ProblemEditorPanel
                  :problem="problem"
                  :validation-error-map="validationErrorMap"
                  :get-field-override="getFieldOverride"
                />
              </n-layout>
            </template>
            <template #2>
              <StudioSidebar
                :selected-adapter="selectedAdapter"
                :target-config="targetConfig"
                :credential-config="credentialConfig"
                :validation-errors="validationErrors"
                :target-missing-fields="targetMissingFields"
                :payload-preview="payloadPreview"
                :problem="problem"
                :uploading="uploading"
                :runtime-label="runtimeLabel"
                :runtime-hint="runtimeHint"
                @upload="handleUpload"
              />
            </template>
          </n-split>
        </n-space>
      </n-layout-content>
    </n-layout>
  </n-config-provider>
</template>
