# CAUX8-Parser

CAUX8-Parser 是一个用于辅助 CAU Moodle 平台 Online Judge 题目管理的工具集。它包含两个独立的子项目，分别针对不同的使用场景提供了批量导入题目的解决方案。

## 项目结构

本项目包含以下两个主要工具：

### 1. caux8_moodle_parser (Python)
**功能**: 格式转换工具 (FPS XML -> Moodle XML)

这是一个 Python 编写的解析器，主要用于将通用的 FPS (Free Problem Set) 格式的题目（常见于 HUSTOJ、QDUOJ 等开源 OJ 系统）转换为 Moodle 可以识别的 XML 格式。

*   **输入**: FPS 格式的 XML 文件（通常包含题目描述、输入输出样例、测试用例等）。
*   **输出**: Moodle XML 格式文件 (`EXPORT.xml`)。
*   **用途**: 生成的 XML 文件可以通过 Moodle 课程管理界面的 "题库" -> "导入" 功能，批量将题目导入到 Moodle 题库中。

### 2. caux8_req_constructor (TypeScript)
**功能**: 自动化请求构造器 (Direct HTTP Import)

这是一个基于 Node.js/TypeScript 的自动化脚本工具，用于通过模拟 HTTP 请求直接在 CAU Moodle 平台上创建题目。

*   **输入**: 在代码中定义的题目对象（包含基本信息、描述、测试用例数据）。
*   **操作**: 模拟用户登录后的操作，发送表单数据创建题目实体，并上传测试用例。
*   **用途**: 适用于需要更精细控制题目创建过程，或者需要绕过标准 XML 导入限制，直接通过网络接口批量创建和配置 OJ 题目的场景。

## 快速开始

请进入各个子目录查看详细的安装和使用说明：

*   **格式转换 (Python)**: [caux8_moodle_parser/README.md](./caux8_moodle_parser/README.md) (需自行查阅代码或补充文档)
*   **自动化导入 (TypeScript)**: [caux8_req_constructor/README.md](./caux8_req_constructor/README.md)

## 许可证

[LICENSE](./LICENSE)
