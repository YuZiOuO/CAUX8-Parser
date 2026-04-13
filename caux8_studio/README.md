# CAUX8 Studio

这是仓库内的前端原型项目，使用 `Vue 3 + Vite + Naive UI`。

当前默认使用 `bun` 作为包管理器和脚本入口。

当前目标：

- 在 `studio` 内部维护一层 `x8req` 抽象
- 用单页面验证通用题目模型是否足够支撑后续 UI
- 直接以 Tauri 作为桌面运行时承载真实上传

开发命令：

```bash
cd caux8_studio
bun install
bun dev
bun run tauri:dev
```

Ubuntu 24.04 如果第一次接 Tauri，需要先安装系统依赖：

```bash
sudo apt-get install -y libgtk-3-dev libwebkit2gtk-4.1-dev libayatana-appindicator3-dev librsvg2-dev
```

当前目录结构里，`x8req` 已经直接收进 `studio/src/x8req/`，界面层直接依赖这层抽象。
这样后续如果接入 Tauri：

- 可以继续让界面直接调本地 `x8req` TS 映射逻辑
- 也可以把上传动作替换成 Tauri command
- 如果后面要再包一层前端 API，也可以在 `studio` 内部做，不需要再引用外部工程

当前前端分层：

- `src/x8req/`: 平台无关题目模型 + adapter 目录 + 平台映射与导出/上传实现
- `src/studio/`: Studio 页面状态、默认题目、动态表单状态
- `src/components/`: 纯界面组件，尽量不直接接触平台上传细节
- `src/runtime/`: Tauri command 调用边界
- `src-tauri/`: 桌面端后端，负责真实 HTTP 上传

CAUX8 上传链路：

1. `ProblemEditorPanel` 编辑通用 `Problem`
2. 在输出页选择 `CAUX8` adapter，并填写目标配置和凭证
3. `useStudioState` 做校验、生成平台提交体，并触发上传
4. `src/runtime/upload.ts` 直接调用 Tauri `submit_problem`
5. `src-tauri` 根据 `adapterId` 分发到具体平台上传器
6. CAUX8 上传器提交题目请求，再提交测试点请求

Moodle XML 导出链路：

1. `ProblemEditorPanel` 编辑通用 `Problem`
2. 在输出页选择 `Moodle XML` adapter
3. `useStudioState` 做校验并生成 XML 预览
4. 点击“导出 XML”后通过 Tauri 保存到本地 `.xml` 文件

当前约定的 Tauri command 形状：

```ts
invoke("submit_problem", {
  payload: {
    adapterId: string,
    question: unknown,
    credentials: Record<string, string | number | null>,
  },
})
```

也就是说，后面如果接 Tauri，Rust 端只需要：

- 接收 `payload`
- 根据 `adapterId` 分发到对应平台
- 直接消费前端 adapter 已经生成好的平台 payload
- 在后端执行真实 HTTP 上传
- 返回 `{ ok, message, data }`

这样可以直接绕开浏览器 CORS，同时也不会把 cookie/session 处理暴露在页面层。
平台映射逻辑仍然只保留在 `src/x8req/` 这一份，桌面端只负责上传。

CAUX8 Session 页内置了会话解析逻辑：

- 输入浏览器里拿到的 `MoodleSession` 和课程 `Course ID`
- 通过 Tauri command 请求 `course/view.php`
- 从课程页解析 `sesskey`、登录信息和 `section-*` 列表
- 点击“应用到上传配置”后写入上传页的 `course`、`section`、`sesskey` 和 `MoodleSession`

Problem Import 页已经内置了旧 parser 的核心逻辑：

- 粘贴 FPS XML
- 或粘贴 YBT JSON，并可额外提供测试文件名到文件内容的 JSON 映射
- 解析 `title`、题面、样例、测试点、时间限制和内存限制
- 转成 Studio 内部通用 `Problem`
- 点击“应用到题目编辑器”后复用现有 CAUX8 上传链路
- 同时生成 Moodle CodeRunner XML 预览
