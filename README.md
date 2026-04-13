# CAUX8-Parser

CAUX8-Parser 是一个用于辅助 CAU Moodle 平台 Online Judge 题目管理的工具集。当前仓库包含一个 Python 格式转换器，以及一个正在向 Tauri 前端整合的 Studio 原型。

## 项目结构

本项目包含以下两个主要工具：

### 1. caux8_moodle_parser (Python)
**功能**: 格式转换工具 (FPS XML -> Moodle XML)

这是一个 Python 编写的解析器，主要用于将通用的 FPS (Free Problem Set) 格式的题目（常见于 HUSTOJ、QDUOJ 等开源 OJ 系统）转换为 Moodle 可以识别的 XML 格式。

*   **输入**: FPS 格式的 XML 文件（通常包含题目描述、输入输出样例、测试用例等）。
*   **输出**: Moodle XML 格式文件 (`EXPORT.xml`)。
*   **用途**: 生成的 XML 文件可以通过 Moodle 课程管理界面的 "题库" -> "导入" 功能，批量将题目导入到 Moodle 题库中。

### 2. caux8_studio (TypeScript / Bun / Naive UI)
**功能**: Studio 原型与前端内置适配层

这是一个基于 Bun / Vue / Naive UI 的前端项目，内部已经收纳了原先的 TypeScript 请求构造逻辑，并保留了平台无关 `Problem`、adapter 和 `CAUX8` 平台实现。

*   **输入**: 通用 `Problem` 模型、平台 adapter 配置与凭证。
*   **操作**: 在前端内完成题目编辑、平台字段映射和 payload 预览，后续可接入 Tauri command 做真实上传。
*   **用途**: 作为未来桌面工具的前端与适配层基础。

## 快速开始

请进入各个子目录查看详细的安装和使用说明：

*   **格式转换 (Python)**: [caux8_moodle_parser/README.md](./caux8_moodle_parser/README.md) (需自行查阅代码或补充文档)
*   **Studio 原型 (TypeScript)**: [caux8_studio/README.md](./caux8_studio/README.md)

## 许可证

[LICENSE](./LICENSE)
