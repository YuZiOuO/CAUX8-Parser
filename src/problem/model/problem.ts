export interface ProblemStatement {
  /**
   * 题面内容
   * 当前先统一按文本/HTML字符串处理，后续 UI 如果要做富文本编辑，再往上包结构
   */
  text: string;

  /**
   * 题面格式
   * plain: 普通文本
   * html: 已经是可直接提交的平台 HTML
   */
  format?: "plain" | "html";
}

export type ProblemTestCaseVisibility = "show" | "hide";

export type ProblemTestCaseKind = "normal" | "precheck" | "both";

export interface ProblemTestCase {
  input: string;
  output: string;
  feedback?: string;
  /**
   * 测试点权重比例
   * 当前建议使用 0.0 ~ 1.0 之间且平台支持的值
   */
  weight?: number;

  /**
   * 是否将该测试点作为示例展示给用户
   * 对应 Moodle CodeRunner 的 useasexample
   */
  isExample?: boolean;

  /**
   * 失败后是否隐藏后续测试点
   * 对应 Moodle CodeRunner 的 hiderestiffail
   */
  stopOnFailure?: boolean;

  /**
   * 测试点展示方式
   * 对应 Moodle CodeRunner 的 display
   */
  visibility?: ProblemTestCaseVisibility;

  /**
   * 测试点类型
   * 当前先抽象为 normal / precheck / both
   */
  kind?: ProblemTestCaseKind;
}

export interface ProblemExecutionSettings {
  /**
   * 平台具体语言编号由 adapter 决定如何解释
   */
  language?: string;
  compileOnly?: boolean;
  preamble?: string;
  postamble?: string;
  forbiddenWords?: string;
}

export interface ProblemLimits {
  /**
   * 单位: 秒
   */
  timeLimitSeconds?: number;

  /**
   * 单位: 字节
   */
  memoryLimitBytes?: number;
}

export interface ProblemGrading {
  totalGrade?: number;
  presentationErrorRatio?: number;
}

export interface ProblemMetadata {
  /**
   * 平台外部编号
   * 后续可映射到 Moodle XML 的 idnumber 等字段
   */
  externalId?: string;

  /**
   * 标签
   * 当前 CAUX8 adapter 不消费，先为 Moodle / UI 检索预留
   */
  tags?: string[];
}

export interface Problem {
  title: string;
  statement: ProblemStatement;
  /**
   * 一般反馈
   * 当前 CAUX8 adapter 不消费，Moodle XML 导出时可直接映射
   */
  generalFeedback?: ProblemStatement;
  testCases: ProblemTestCase[];
  execution?: ProblemExecutionSettings;
  limits?: ProblemLimits;
  grading?: ProblemGrading;
  metadata?: ProblemMetadata;
}
