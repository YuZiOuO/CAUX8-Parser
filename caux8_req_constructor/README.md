# CAUX8 Request Constructor

这是一个用于自动化在 CAU Moodle 平台 (page.cau.edu.cn) 上创建题目和导入测试用例的工具。它是 CAUX8-Parser 项目的一个子模块。

## 1. 主要功能

*   **自动化题目创建**: 通过模拟 HTTP 请求，自动在 Moodle 课程中创建新的 Online Judge 题目。
*   **测试用例导入**: 在创建题目后，自动将关联的测试用例（输入/输出）上传并保存。
*   **请求构造**: 封装了复杂的 Moodle 表单数据构造逻辑，简化了题目和测试用例的数据结构。
*   **会话管理**: 支持使用 `MoodleSession` Cookie 和 `sesskey` 进行身份验证。

## 2. 如何使用

### 前置要求
*   Node.js 环境
*   pnpm 包管理器
*   有效的 CAU Moodle 账号权限（需要有创建题目的权限）

### 安装依赖
在 `caux8_req_constructor` 目录下运行：
```bash
pnpm install
```

### 配置与运行

1.  **获取凭证**:
    你需要获取有效的 `MoodleSession` Cookie 和 `sesskey`。
    *   你可以登录 `http://page.cau.edu.cn`，在浏览器开发者工具中查看 Cookie 获取 `MoodleSession`。
    *   `sesskey` 通常可以在页面源码的登出链接或表单隐藏域中找到。
    *   项目中提供了一个 `auth.py` 脚本，可以辅助获取 `sesskey` (需要 Python 环境和 `requests`, `beautifulsoup4` 库)。

2.  **编写脚本**:
    参考 `main.ts` 文件，构造你的题目数据对象 `RequiredQuestion`，并调用 `importQuestion` 函数。

    ```typescript
    import type { Problem } from "./core/problem.js";
    import { caux8QuestionAdapter } from "./adapters/index.js";

    const problem: Problem = {
      title: "题目名称",
      statement: {
        text: "题目描述内容",
        format: "plain",
      },
      testCases: [
        {
          input: "1 2\n",
          output: "3\n",
          weight: 1.0,
          feedback: "",
        },
      ],
    };

    const result = await caux8QuestionAdapter.upload(problem, {
      target: {
        course: 141,
        section: 10,
        sesskey: "你的sesskey",
      },
      credentials: {
        moodleSession: "你的MoodleSession字符串",
      },
    });

    console.log(result.questionId);
    ```

3.  **运行**:
    使用 `ts-node` 直接运行 `main.ts`，或者编译为 JS 后运行。

## 3. 文件树结构与作用

```
caux8_req_constructor/
├── auth.py             # Python 辅助脚本，用于通过 Cookie 获取 sesskey 和解析页面信息
├── core/               # 平台无关的题目模型
│   └── problem.ts
├── adapters/           # 统一适配器协议与注册表
│   ├── index.ts
│   └── types.ts
├── platforms/          # 各平台具体实现
│   └── caux8/
│       ├── adapter.ts
│       ├── config.ts
│       ├── form-data.ts
│       ├── http-client.ts
│       ├── index.ts
│       ├── types.ts
│       ├── upload.ts
│       └── factory/
├── main.ts             # 程序入口示例，展示如何定义题目数据并调用导入功能
├── package.json        # 项目依赖配置
└── tsconfig.json       # TypeScript 编译配置
```

## 4. 当前结构的重构思路

这次整理主要做了三件事：

*   **区分三层职责**：`core/` 负责平台无关题目模型，`adapters/` 负责统一适配器协议，`platforms/` 负责具体平台实现。
*   **把平台细节收进 `platforms/caux8/`**：默认值、HTTP 客户端、FormData 拼装和上传流程都不再散落在根目录。
*   **让 UI 可以直接消费 adapter 元数据**：后续界面层可以根据 adapter 提供的字段定义动态渲染目标平台配置表单。

如果后续继续重构，建议优先做这两步：

*   给 `auth.py` 对应的鉴权流程补一个 TypeScript 版本，避免 Python/TS 双栈维护。
*   为 `factory/` 增加最基本的请求体快照测试，避免字段调整时无声回归。
