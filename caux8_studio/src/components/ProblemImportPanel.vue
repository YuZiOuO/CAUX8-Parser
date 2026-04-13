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
  <n-card title="Problem Import">
    <n-space vertical size="medium">
      <n-alert type="info" :show-icon="true">
        已迁移 Python moodle_parser 的核心能力：FPS XML / YBT JSON 可以转成 Studio
        的通用 Problem，并同时生成 Moodle CodeRunner XML 预览。
      </n-alert>

      <n-form label-placement="top" size="small">
        <n-form-item label="Import Format">
          <n-select
            v-model:value="importFormat"
            :options="importFormatOptions"
            style="width: 240px"
          />
        </n-form-item>

        <n-form-item
          v-if="importFormat === 'ybt'"
          label="YBT Test Files Map"
        >
          <n-input
            v-model:value="ybtFilesText"
            type="textarea"
            :autosize="{ minRows: 4, maxRows: 12 }"
            placeholder='可选。JSON 对象，例如 {"a.in":"1 2","a.out":"3"}'
          />
        </n-form-item>

        <n-form-item :label="importFormat === 'fps' ? 'FPS XML' : 'YBT JSON'">
          <n-input
            v-model:value="sourceText"
            type="textarea"
            :autosize="{ minRows: 12, maxRows: 24 }"
            :placeholder="
              importFormat === 'fps'
                ? '粘贴 fps / item XML'
                : '粘贴一本通 JSON。测试文件内容暂未从文件系统读取，可先用于导入题面和样例。'
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
          <n-form-item label="Imported Problem">
            <n-select
              v-model:value="selectedProblemIndex"
              :options="problemOptions"
            />
          </n-form-item>
        </n-form>

        <n-divider title-placement="left">Problem Preview</n-divider>
        <n-code
          :code="stringify(selectedProblem?.problem)"
          language="json"
          style="
            max-height: 360px;
            overflow: auto;
            border: 1px solid var(--n-border-color);
            border-radius: 4px;
            padding: 8px;
          "
        />

        <n-divider title-placement="left">Moodle XML Preview</n-divider>
        <n-code
          :code="moodleXmlPreview"
          language="xml"
          style="
            max-height: 360px;
            overflow: auto;
            border: 1px solid var(--n-border-color);
            border-radius: 4px;
            padding: 8px;
          "
        />
      </template>
    </n-space>
  </n-card>
</template>
