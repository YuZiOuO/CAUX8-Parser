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
    import { importQuestion } from "./bootstrap.js";
    import type { RequiredQuestion } from "./types.js";

    const q: RequiredQuestion = {
      basicInfo: {
        name: "题目名称",
        course: 141, // 课程ID
        section: 10, // 章节ID
        mform_showadvanced_last: 0,
        sesskey: "你的sesskey",
      },
      description: { text: "题目描述内容" },
      testCases: [
        {
          caseid: -1,
          input: "1 2\n",
          output: "3\n",
          subgrade: "1.0",
          feedback: "",
        },
      ],
    };

    const result = await importQuestion(q, {
      moodleSession: "你的MoodleSession字符串",
    });

    console.log(result.questionId);
    ```

3.  **运行**:
    使用 `ts-node` 直接运行 `main.ts`，或者编译为 JS 后运行。

## 3. 文件树结构与作用

```
caux8_req_constructor/
├── auth.py             # Python 辅助脚本，用于通过 Cookie 获取 sesskey 和解析页面信息
├── bootstrap.ts        # 核心逻辑文件，负责串联“创建题目 -> 导入测试用例”流程
├── config.ts           # 固定端点、默认配置和跳转策略
├── form-data.ts        # FormData 填充辅助函数
├── http-client.ts      # 负责创建携带 MoodleSession 的 HTTP 客户端
├── main.ts             # 程序入口示例，展示如何定义题目数据并调用导入功能
├── factory/            # 请求体构造工厂目录
│   ├── defaults.ts     # 包含表单默认值和辅助填充函数
│   ├── question.ts     # 负责构造创建题目的 FormData 请求体
│   └── testcase.ts     # 负责构造添加测试用例的 FormData 请求体
├── types.ts            # 所有显式导出的 TypeScript 类型
├── package.json        # 项目依赖配置
└── tsconfig.json       # TypeScript 编译配置
```

## 4. 当前结构的重构思路

这次整理主要做了三件事：

*   **把全局 `.d.ts` 类型改成模块化导出**：避免类型污染全局命名空间，也让 IDE 跳转和引用更直接。
*   **把默认值和 HTTP 逻辑拆开**：默认表单配置放到 `config.ts`，Cookie 客户端放到 `http-client.ts`，`bootstrap.ts` 只保留业务流程。
*   **消掉重复输入的 `sesskey`**：`sesskey` 仍然在题目定义里维护，但导入函数只再接收 `MoodleSession`，减少凭证不一致的风险。

如果后续继续重构，建议优先做这两步：

*   给 `auth.py` 对应的鉴权流程补一个 TypeScript 版本，避免 Python/TS 双栈维护。
*   为 `factory/` 增加最基本的请求体快照测试，避免字段调整时无声回归。
