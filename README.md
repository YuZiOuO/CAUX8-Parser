# CAUX8-Parser

CAUX8-Parser 是一个用于辅助 CAU Moodle 平台 Online Judge 题目管理的工具集。当前仓库的主实现已经收敛到 `caux8_studio`，使用 `TypeScript + Bun + Vue + Tauri` 承载题目编辑、格式转换与上传。

## 项目结构

当前主要目录：

### 1. caux8_studio (TypeScript / Bun / Naive UI / Tauri)
**功能**: Studio 原型与前端内置适配层

这是一个基于 Bun / Vue / Naive UI 的前端项目，内部维护平台无关 `Problem`、平台适配层、Moodle XML 导出能力和 CAUX8 上传链路。

*   **输入**: 通用 `Problem` 模型、目标平台配置与凭证。
*   **操作**: 在前端内完成题目编辑、平台字段映射、Moodle XML 导出与 CAUX8 上传。
*   **用途**: 作为后续桌面工具的主体实现。

## 快速开始

请进入 `caux8_studio` 查看详细说明：

*   **Studio 原型 (TypeScript)**: [caux8_studio/README.md](./caux8_studio/README.md)

## 许可证

[LICENSE](./LICENSE)
