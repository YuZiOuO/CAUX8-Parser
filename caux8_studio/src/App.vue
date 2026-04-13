<script setup lang="ts">
import { ref } from "vue";
import { createDiscreteApi } from "naive-ui";
import {
  NAlert,
  NConfigProvider,
  NForm,
  NFormItem,
  NGlobalStyle,
  NLayout,
  NLayoutContent,
  NLayoutHeader,
  NPageHeader,
  NSelect,
  NSpace,
  NSplit,
  NTabPane,
  NTabs,
  NTag,
} from "naive-ui";
import Caux8SessionPanel from "@/components/Caux8SessionPanel.vue";
import ProblemImportPanel from "@/components/ProblemImportPanel.vue";
import ProblemEditorPanel from "@/components/ProblemEditorPanel.vue";
import StudioSidebar from "@/components/StudioSidebar.vue";
import {
  RuntimeCommandError,
  type RuntimeCommandErrorInfo,
} from "@/runtime/errors";
import type {
  Caux8CourseSection,
  Caux8SessionInfo,
} from "@/runtime/session";
import { useStudioState } from "@/studio/use-studio-state";
import type { Problem } from "@/x8req/core/problem.js";

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
  credentialMissingFields,
  submissionPreview,
  xmlPreview,
  uploading,
  getFieldOverride,
  submitCurrentProblem,
  applyCaux8Session,
  replaceProblem,
} = useStudioState();

const { message } = createDiscreteApi(["message"]);
const uploadError = ref<RuntimeCommandErrorInfo | null>(null);
const activePage = ref("upload");

async function handleUpload() {
  try {
    uploadError.value = null;
    const result = await submitCurrentProblem();

    if (result.ok) {
      message.success(result.message ?? "上传完成");
      return;
    }

    message.error(result.message ?? "上传失败");
  } catch (error) {
    if (error instanceof RuntimeCommandError) {
      uploadError.value = error.info;
      message.error(error.info.message);
      return;
    }

    const fallbackMessage = error instanceof Error ? error.message : String(error);
    uploadError.value = {
      code: "unhandled_frontend_error",
      message: fallbackMessage,
    };
    message.error(fallbackMessage);
  }
}

function handleApplySession(
  session: Caux8SessionInfo,
  moodleSession: string,
  section?: Caux8CourseSection,
) {
  applyCaux8Session(session, moodleSession, section);
  activePage.value = "upload";
}

function handleApplyImportedProblem(problem: Problem) {
  replaceProblem(problem);
  activePage.value = "upload";
}

async function handleExportXml() {
  if (!xmlPreview.value) {
    return;
  }

  try {
    await navigator.clipboard.writeText(xmlPreview.value);
    message.success("Moodle XML 已复制到剪贴板");
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    message.error(`复制 XML 失败: ${detail}`);
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
          <n-tabs v-model:value="activePage" type="line" animated>
            <n-tab-pane name="import" tab="Problem Import">
              <ProblemImportPanel @apply="handleApplyImportedProblem" />
            </n-tab-pane>

            <n-tab-pane name="session" tab="CAUX8 Session">
              <Caux8SessionPanel @apply="handleApplySession" />
            </n-tab-pane>

            <n-tab-pane name="upload" tab="Problem Output">
              <n-space vertical size="medium">
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
                  style="height: calc(100vh - 190px)"
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
                      :credential-missing-fields="credentialMissingFields"
                      :submission-preview="submissionPreview"
                      :xml-preview="xmlPreview"
                      :problem="problem"
                      :uploading="uploading"
                      :upload-error="uploadError"
                      @submit="handleUpload"
                      @export-xml="handleExportXml"
                    />
                  </template>
                </n-split>
              </n-space>
            </n-tab-pane>
          </n-tabs>
        </n-space>
      </n-layout-content>
    </n-layout>
  </n-config-provider>
</template>
