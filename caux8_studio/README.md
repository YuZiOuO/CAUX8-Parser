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
