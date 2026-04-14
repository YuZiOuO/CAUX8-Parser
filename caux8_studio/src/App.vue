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
  NLayoutSider,
  NSelect,
  NSpace,
  NDivider,
  NModal,
  NButton,
  NCard,
  NList,
  NListItem,
  NThing,
} from "naive-ui";
import Caux8SessionPanel from "@/components/Caux8SessionPanel.vue";
import ProblemImportPanel from "@/components/ProblemImportPanel.vue";
import ProblemEditorPanel from "@/components/ProblemEditorPanel.vue";
import StudioSidebar from "@/components/StudioSidebar.vue";
import {
  RuntimeCommandError,
  type RuntimeCommandErrorInfo,
} from "@/runtime/errors";
import { exportXmlToFile } from "@/runtime/export";
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
  getFieldOverride,
  submitCurrentProblem,
  applyResolvedSession,
  replaceProblem,
  appendProblem,
  appendBlankProblem,
  removeProblem,
} = useStudioState();

const { message } = createDiscreteApi(["message"]);
const uploadError = ref<RuntimeCommandErrorInfo | null>(null);

const showImportModal = ref(false);
const showSessionModal = ref(false);

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
  applyResolvedSession(session, moodleSession, section);
  showSessionModal.value = false;
}

function handleApplyImportedProblem(problemInput: Problem) {
  replaceProblem(problemInput);
  showImportModal.value = false;
}

async function handleExportXml() {
  if (!xmlPreview.value) {
    return;
  }

  try {
    const result = await exportXmlToFile({
      xml: xmlPreview.value,
      defaultFileName: problem.value.title || "problem.xml",
    });

    if (result.canceled) {
      return;
    }

    message.success(`Moodle XML 已保存到 ${result.path}`);
  } catch (error) {
    if (error instanceof RuntimeCommandError) {
      message.error(error.info.message);
      return;
    }

    const detail = error instanceof Error ? error.message : String(error);
    message.error(`导出 XML 失败: ${detail}`);
  }
}
</script>

<template>
  <n-config-provider>
    <n-global-style />
    
    <!-- 弹窗：导入题目 -->
    <n-modal
      v-model:show="showImportModal"
      preset="card"
      title="导入题目"
      style="width: 900px; max-width: 90vw;"
    >
      <ProblemImportPanel @apply="handleApplyImportedProblem" />
    </n-modal>

    <n-layout has-sider position="absolute">
      <!-- 左栏：数据源与列表 (Data Source & List) -->
      <n-layout-sider
        bordered
        collapse-mode="width"
        :collapsed-width="0"
        :width="260"
        show-trigger="arrow-circle"
        :native-scrollbar="false"
        content-style="padding: 16px;"
      >
        <n-space vertical>
          <n-button type="primary" dashed block @click="showImportModal = true">
            导入题目
          </n-button>

          <n-button secondary block @click="appendBlankProblem">
            新建空题目
          </n-button>
          
          <n-divider />

          <n-list hoverable clickable>
            <n-list-item
              v-for="(p, index) in problems"
              :key="index"
              @click="activeProblemIndex = index"
              :style="{ backgroundColor: activeProblemIndex === index ? 'var(--n-color-hover)' : 'inherit', borderLeft: activeProblemIndex === index ? '3px solid var(--n-primary-color)' : '3px solid transparent' }"
            >
              <n-thing
                :title="p.title || '未命名题目'"
                :description="`问题 ${index + 1}`"
              />
              <template #suffix>
                <n-button
                  size="tiny"
                  circle
                  quaternary
                  type="error"
                  @click.stop="removeProblem(index)"
                >
                  ×
                </n-button>
              </template>
            </n-list-item>
          </n-list>
        </n-space>
      </n-layout-sider>

      <!-- 中栏：通用问题编辑器 (Editor) -->
      <n-layout
        :native-scrollbar="false"
        content-style="padding: 16px;"
      >
        <ProblemEditorPanel
          :problem="problem"
          :validation-error-map="validationErrorMap"
          :get-field-override="getFieldOverride"
        />
      </n-layout>

      <!-- 右栏：平台发布与全局配置中心 (Publish & Global Config) -->
      <n-layout-sider
        bordered
        :width="420"
        :native-scrollbar="false"
        content-style="padding: 16px; background-color: var(--n-border-color);"
      >
        <n-space vertical size="medium">
          <!-- 平台选择区 -->
          <n-card title="目标平台" size="small" :bordered="false">
            <n-form label-placement="top" size="small" :show-feedback="false">
              <n-form-item label="选择适配器">
                <n-select
                  v-model:value="selectedAdapterId"
                  :options="adapterOptions"
                />
              </n-form-item>
            </n-form>

            <n-text
              v-if="selectedAdapter"
              depth="3"
              style="display: block; font-size: 12px; margin-top: 12px;"
            >
              {{ selectedAdapter.definition.description }}
            </n-text>
          </n-card>

          <!-- 全局会话凭据获取区 (集成在侧边栏) -->
          <n-card
            v-if="selectedAdapter.definition.sessionResolver"
            title="平台会话抓取"
            size="small"
            :bordered="false"
          >
            <Caux8SessionPanel @apply="handleApplySession" />
          </n-card>

          <!-- 具体 Adapter 参数及上传/导出执行 -->
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
        </n-space>
      </n-layout-sider>
    </n-layout>
  </n-config-provider>
</template>
