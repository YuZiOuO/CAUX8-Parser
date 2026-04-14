<script setup lang="ts">
import { computed, ref } from "vue";
import {
  NAlert,
  NButton,
  NCard,
  NCode,
  NDivider,
  NForm,
  NFormItem,
  NInput,
  NSelect,
  NSpace,
  NText,
  NScrollbar,
  createDiscreteApi,
} from "naive-ui";
import type { Problem } from "@/x8req/core/problem.js";
import { exportMoodleQuestionToXml } from "@/x8req/moodle";
import {
  parseFpsProblems,
  type FpsImportedProblem,
  parseYbtProblem,
  type YbtImportedProblem,
} from "@/x8req/importers";

const emit = defineEmits<{
  apply: [problem: Problem];
}>();

type ImportFormat = "fps" | "ybt";
type ImportedProblem = FpsImportedProblem | YbtImportedProblem;

const importFormatOptions = [
  { label: "FPS XML", value: "fps" },
  { label: "YBT JSON", value: "ybt" },
];

const importFormat = ref<ImportFormat>("fps");
const sourceText = ref("");
const ybtFilesText = ref("{}");
const importedProblems = ref<ImportedProblem[]>([]);
const selectedProblemIndex = ref<number | null>(null);
const parseError = ref<string | null>(null);

const { message } = createDiscreteApi(["message"]);

const selectedProblem = computed(() => {
  if (selectedProblemIndex.value === null) {
    return null;
  }

  return importedProblems.value[selectedProblemIndex.value] ?? null;
});

const problemOptions = computed(() =>
  importedProblems.value.map((entry, index) => ({
    label: `${index + 1}. ${entry.title} (${entry.source})`,
    value: index,
  })),
);

const moodleXmlPreview = computed(() =>
  selectedProblem.value
    ? exportMoodleQuestionToXml(selectedProblem.value.moodleQuestion)
    : "",
);

function stringify(value: unknown) {
  return JSON.stringify(value, null, 2);
}

function handleParse() {
  parseError.value = null;
  importedProblems.value = [];
  selectedProblemIndex.value = null;

  try {
    const ybtFiles =
      importFormat.value === "ybt"
        ? (JSON.parse(ybtFilesText.value || "{}") as Record<string, string>)
        : {};
    const parsed =
      importFormat.value === "fps"
        ? parseFpsProblems(sourceText.value)
        : [parseYbtProblem(sourceText.value, ybtFiles)];
    importedProblems.value = parsed;
    selectedProblemIndex.value = parsed.length > 0 ? 0 : null;
    message.success(`解析完成：${parsed.length} 道题`);
  } catch (error) {
    parseError.value = error instanceof Error ? error.message : String(error);
    message.error(parseError.value);
  }
}

function handleApply() {
  if (!selectedProblem.value) {
    return;
  }

  emit("apply", selectedProblem.value.problem);
  message.success("已应用到题目编辑器");
}
</script>

<template>
  <n-card title="题目导入">
    <n-space vertical size="medium">
      <n-text depth="3" style="font-size: 12px; display: block; margin-bottom: 12px;">
        已内置 FPS XML / YBT JSON 导入能力：导入的内容可以直接转成 Studio 的通用 Problem，
        并同时生成 Moodle XML 验证预览。
      </n-text>

      <n-form label-placement="top" size="small">
        <n-form-item label="导入格式">
          <n-select
            v-model:value="importFormat"
            :options="importFormatOptions"
            style="width: 240px"
          />
        </n-form-item>

        <n-form-item
          v-if="importFormat === 'ybt'"
          label="YBT 测试文件映射"
        >
          <n-input
            v-model:value="ybtFilesText"
            type="textarea"
            :autosize="{ minRows: 4, maxRows: 12 }"
            placeholder="可选，填写测试文件内容映射"
          />
        </n-form-item>

        <n-form-item :label="importFormat === 'fps' ? 'FPS XML 内容' : 'YBT JSON 内容'">
          <n-input
            v-model:value="sourceText"
            type="textarea"
            :autosize="{ minRows: 12, maxRows: 24 }"
            :placeholder="
              importFormat === 'fps'
                ? '粘贴题目内容'
                : '粘贴一本通题目内容。测试文件暂不从本地读取，可先导入题面和样例。'
            "
          />
        </n-form-item>

        <n-space>
          <n-button
            type="primary"
            :disabled="sourceText.trim() === ''"
            @click="handleParse"
          >
            解析题目
          </n-button>
          <n-button
            secondary
            :disabled="!selectedProblem"
            @click="handleApply"
          >
            应用到题目编辑器
          </n-button>
        </n-space>
      </n-form>

      <n-alert
        v-if="parseError"
        type="error"
        title="解析失败"
        :show-icon="true"
      >
        {{ parseError }}
      </n-alert>

      <template v-if="importedProblems.length > 0">
        <n-form label-placement="top" size="small">
          <n-form-item label="已导入题目">
            <n-select
              v-model:value="selectedProblemIndex"
              :options="problemOptions"
            />
          </n-form-item>
        </n-form>

        <n-divider title-placement="left">题目预览</n-divider>
        <n-card
          embedded
          size="small"
          content-style="padding: 0;"
          :bordered="false"
        >
          <n-scrollbar style="max-height: 360px;">
            <div style="padding: 12px;">
              <n-code :code="stringify(selectedProblem?.problem)" language="json" word-wrap />
            </div>
          </n-scrollbar>
        </n-card>

        <n-divider title-placement="left">Moodle XML 预览</n-divider>
        <n-card
          embedded
          size="small"
          content-style="padding: 0;"
          :bordered="false"
        >
          <n-scrollbar style="max-height: 360px;">
            <div style="padding: 12px;">
              <n-code :code="moodleXmlPreview" language="xml" word-wrap />
            </div>
          </n-scrollbar>
        </n-card>
      </template>
    </n-space>
  </n-card>
</template>
