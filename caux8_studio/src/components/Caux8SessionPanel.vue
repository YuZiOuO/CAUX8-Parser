<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import {
  NAlert,
  NButton,
  NCard,
  NCode,
  NForm,
  NFormItem,
  NInput,
  NInputNumber,
  NSelect,
  NSpace,
  NText,
  createDiscreteApi,
} from "naive-ui";
import {
  RuntimeCommandError,
  type RuntimeCommandErrorInfo,
} from "@/runtime/errors";
import {
  resolveCaux8Session,
  type Caux8CourseSection,
  type Caux8SessionInfo,
} from "@/runtime/session";

const emit = defineEmits<{
  apply: [
    session: Caux8SessionInfo,
    moodleSession: string,
    section?: Caux8CourseSection,
  ];
}>();

const form = reactive({
  moodleSession: "",
  courseId: 141,
});
const resolving = ref(false);
const resolvedSession = ref<Caux8SessionInfo | null>(null);
const selectedSection = ref<Caux8CourseSection | null>(null);
const resolveError = ref<RuntimeCommandErrorInfo | null>(null);

const { message } = createDiscreteApi(["message"]);

const canResolve = computed(
  () => form.moodleSession.trim() !== "" && Number.isInteger(form.courseId),
);

const sectionOptions = computed(
  () =>
    resolvedSession.value?.sections.map((section) => ({
      label: `${section.section}: ${section.name ?? section.id}`,
      value: section.id,
    })) ?? [],
);

const selectedSectionId = computed({
  get() {
    return selectedSection.value?.id ?? null;
  },
  set(value: string | null) {
    selectedSection.value =
      resolvedSession.value?.sections.find((section) => section.id === value) ??
      null;
  },
});

function stringify(value: unknown) {
  return JSON.stringify(value, null, 2);
}

async function handleResolve() {
  if (!canResolve.value) {
    message.error("请填写 MoodleSession 和 Course ID");
    return;
  }

  resolving.value = true;
  resolveError.value = null;
  resolvedSession.value = null;
  selectedSection.value = null;

  try {
    const session = await resolveCaux8Session({
      moodleSession: form.moodleSession.trim(),
      courseId: form.courseId,
    });
    resolvedSession.value = session;
    selectedSection.value = session.sections[0] ?? null;
    message.success("会话解析完成");
  } catch (error) {
    if (error instanceof RuntimeCommandError) {
      resolveError.value = error.info;
      message.error(error.info.message);
      return;
    }

    const fallbackMessage = error instanceof Error ? error.message : String(error);
    resolveError.value = {
      code: "resolve_session_unhandled_error",
      message: fallbackMessage,
    };
    message.error(fallbackMessage);
  } finally {
    resolving.value = false;
  }
}

function handleApply() {
  if (!resolvedSession.value) {
    return;
  }

  emit(
    "apply",
    resolvedSession.value,
    form.moodleSession.trim(),
    selectedSection.value ?? undefined,
  );
  message.success("已写入上传配置");
}

</script>

<template>
  <n-card title="CAUX8 会话解析">
    <n-space vertical size="medium">
      <n-alert type="info" :show-icon="true">
        输入浏览器里的 MoodleSession 和课程 ID，解析 sesskey 与课程 section 列表。
      </n-alert>

      <n-form label-placement="top" size="small">
        <n-form-item label="MoodleSession">
          <n-input
            v-model:value="form.moodleSession"
            type="password"
            show-password-on="click"
            placeholder="粘贴浏览器中的会话值"
          />
        </n-form-item>

        <n-form-item label="课程 ID">
          <n-input-number
            v-model:value="form.courseId"
            :min="1"
            style="width: 240px"
          />
        </n-form-item>

        <n-space>
          <n-button
            type="primary"
            :disabled="!canResolve"
            :loading="resolving"
            @click="handleResolve"
          >
            解析会话
          </n-button>
          <n-button
            :disabled="!resolvedSession"
            secondary
            @click="handleApply"
          >
            应用到上传配置
          </n-button>
        </n-space>
      </n-form>

      <n-alert
        v-if="resolveError"
        type="error"
        title="解析失败"
        :show-icon="true"
      >
        {{ resolveError.message }}
      </n-alert>

      <template v-if="resolvedSession">
        <n-alert type="success" :show-icon="true">
          <n-space vertical size="small">
            <n-text>课程 ID：{{ resolvedSession.courseId }}</n-text>
            <n-text>Sesskey：{{ resolvedSession.sesskey }}</n-text>
            <n-text v-if="resolvedSession.loginInfo">
              登录信息：{{ resolvedSession.loginInfo }}
            </n-text>
          </n-space>
        </n-alert>

        <n-form label-placement="top" size="small">
          <n-form-item label="章节">
            <n-select
              v-model:value="selectedSectionId"
              :options="sectionOptions"
              clearable
              placeholder="选择要写入上传配置的章节"
            />
          </n-form-item>
        </n-form>

        <n-code
          :code="stringify(resolvedSession)"
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

      <n-code
        v-if="resolveError"
        :code="stringify(resolveError)"
        language="json"
        style="
          max-height: 240px;
          overflow: auto;
          border: 1px solid var(--n-border-color);
          border-radius: 4px;
          padding: 8px;
        "
      />
    </n-space>
  </n-card>
</template>
