# CAUX8 Studio

这是仓库内的前端原型项目，使用 `Vue 3 + Vite + Naive UI`。

当前默认使用 `bun` 作为包管理器和脚本入口。

当前目标：

- 在 `studio` 内部维护一层 `x8req` 抽象
- 用单页面验证通用题目模型是否足够支撑后续 UI
- 为后续接入 Tauri command 保留入口

开发命令：

```bash
cd caux8_studio
bun install
bun dev
```

当前目录结构里，`x8req` 已经直接收进 `studio/src/x8req/`，界面层直接依赖这层抽象。
这样后续如果接入 Tauri：

- 可以继续让界面直接调本地 `x8req` TS 映射逻辑
- 也可以把上传动作替换成 Tauri command
- 如果后面要再包一层前端 API，也可以在 `studio` 内部做，不需要再引用外部工程

当前前端分层：

- `src/x8req/`: 平台无关题目模型 + adapter 定义 + CAUX8 平台映射与上传实现
- `src/studio/`: Studio 页面状态、默认题目、动态表单状态
- `src/components/`: 纯界面组件，尽量不直接接触平台上传细节
- `src/runtime/`: 运行时边界。浏览器里只做预览，真实上传通过桌面 runtime 执行

一键上传链路：

1. `ProblemEditorPanel` 编辑通用 `Problem`
2. `StudioSidebar` 收集目标平台配置和凭证
3. `useStudioState` 做校验、生成平台 payload，并触发上传
4. `src/runtime/upload.ts` 检测运行时
5. 浏览器模式直接拒绝真实上传，避免把跨域和 Cookie 逻辑塞进页面
6. Tauri 模式下调用 `upload_problem` command

当前约定的 Tauri command 形状：

```ts
invoke("upload_problem", {
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
更重要的是，平台映射逻辑仍然只保留在 `src/x8req/` 这一份，不需要再在 Rust 里重复维护一套通用 `Problem -> 平台题目` 转换。
