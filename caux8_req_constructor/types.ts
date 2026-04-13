export type NumberBoolean = 0 | 1;

export type RedirectTarget = "preview" | "course" | "none";

export interface RequiredBasicInfo {
  /**
   * 课程编号
   */
  course: number;

  /**
   * 部分编号
   */
  section: number;

  /**
   * Sesskey, 登录时获取,要和moodleSession对应
   */
  sesskey: string;

  /**
   * 作业名称
   * 验证:非空且最多255字符
   */
  name: string;

  /**
   * 在课程页面显示简介
   */
  mform_showadvanced_last: NumberBoolean;
}

export interface BasicInfo extends RequiredBasicInfo {
  assignmenttype: "onlinejudge";
  type: "onlinejudge";
  conditiongraderepeats: 1; // 语义未知
  conditionfieldrepeats: 1; // 语义未知
  coursemodule: "";
  module: 1;
  modulename: "assignment";
  instance: "";
  add: "assignment";
  update: NumberBoolean;
  return: NumberBoolean;
  sr: 0; // 语义未知
  _qf__mod_assignment_mod_form: 1; // 语义未知
}

export interface RequiredDescription {
  /**
   * 描述文本
   * 接受html
   */
  text: string;
}

export interface Description extends RequiredDescription {
  format: 1; // 语义未知
  // itemid: number; // 这个item_id要从上游请求里拿
}

export interface GradeSettings {
  // 成绩
  grade: number; // 0=没有成绩 -1=量表 1-100

  // 评分方式
  advancedgradingmethod_submission: string; // "" = 直接打分,guide = 评分指南,rubric = 量规

  // 成绩类别
  gradecat: number; // 168 = 未分类
}

// 在线评测设置
export interface OnlineJudgeSettings {
  /**
   * 编程语言
   * 常用值: "1111_ideone"(C++11), "1117_ideone"(C++17), "1116_ideone"(Python3.10)
   * 其他可选值来自 Moodle 页面上的 language 下拉框
   */
  language?: string;

  /**
   * 格式错误得分比例
   * 常用值: 1.0, 0.5, 0.0
   */
  ratiope?: number;

  /**
   * CPU使用时间上限
   * 单位:秒
   */
  cpulimit?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  // 内存最多可用，单位为字节；常用值: 67108864(64MB), 134217728(128MB), 268435456(256MB)
  memlimit?: number;

  // 只编译
  compileonly: NumberBoolean;

  // 前缀
  preamble?: string;
  // 后缀
  postamble?: string;

  // 学生代码中禁止出现的词，一行一个,分号结束，注意空格是有效的，比如"or" 和" or " 是不同的，后者是一个独立的词，前者是任何匹配的串，哪怕在for中，都不行
  forbiddenwords?: string;
}

export interface AvailabilityTimeOption {
  day: number; // 1-31
  month: number; // 1-12
  year: number; // 1970-2032
  hour: number; // 00-23
  minute: number; // 00-55 只能为5的倍数
  enabled: number; // 是否启用
}

// 可用性时间
export interface AvailabilityTime {
  // 开放时间
  timeavailable?: AvailabilityTimeOption;

  // 截止时间
  timedue?: AvailabilityTimeOption;
}

// 通用模块设置
export interface CommonModuleSettings {
  // 小组模式
  groupmode?: number; // 0=无小组 1=分隔小组 2=可视小组

  // 可见
  visible?: number;

  // ID号
  /**
   * 成绩计算公式中可用于唯一标识该活动；如果没有被引用，可以留空
   */
  cmidnumber?: string;
}

// 访问限制
export interface AccessRestrictions {
  // 可访问时间
  // 验证:until的时间要比from大
  availablefrom_day?: number;
  availablefrom_month?: number;
  availablefrom_year?: number;
  availablefrom_hour?: number;
  availablefrom_minute?: number;
  availablefrom_enabled?: number;
  availableuntil_day?: number;
  availableuntil_month?: number;
  availableuntil_year?: number;
  availableuntil_hour?: number;
  availableuntil_minute?: number;
  availableuntil_enabled?: number;

  // 成绩条件: itemid 至少要 min % 且少于 max %
  conditiongradegroup_0_conditiongradeitemid?: number;
  conditiongradegroup_0_conditiongrademin?: string;
  conditiongradegroup_0_conditiongrademax?: string;

  // 用户条件 field-operator-value
  conditionfieldgroup_0_conditionfield?: number;
  /**
   * 用户字段名，例如 firstname、lastname、idnumber、email、department
   * 完整列表来自 Moodle 访问限制表单
   */
  conditionfieldgroup_0_conditionfieldoperator?: string;
  /**
   * 比较操作符，例如 contains、doesnotcontain、isequalto、startswith、endswith、isempty、isnotempty
   */
  conditionfieldgroup_0_conditionfieldvalue?: string;

  // 活动可用之前
  showavailability?: number; // 1 = 活动以暗色显示，并显示受限信息,0 = 完全隐藏活动
}

export interface SubmissionSettings {
  // 在课程页面显示简介
  // showdescription?: number; // 这个字段在请求中没有被发送，原因未知

  // 禁止迟交
  preventlate: NumberBoolean;

  // 源文件最大长度，单位为字节；常用值: 1048576(1MB), 2097152(2MB), 5242880(5MB), 20971520(20MB), 0(跟随课程限制)
  maxbytes: number;

  // 学生是否可删除作业
  resubmit: NumberBoolean;

  // 最多可传几个文件
  var1: number; // 1-20

  // 是否允许备注
  var2: NumberBoolean;

  // 在可以提交作业前隐藏作业说明
  var3: NumberBoolean;

  // 用Email提醒教师
  emailteachers: number;
}

export interface RedirectSettings {
  submitbutton?: "保存并预览"; // 如果存在该字段，重定向跳转到题目页
  submitbutton2?: "保存并返回课程"; // 如果存在该字段，重定向跳转到课程页
  // 如果都不存在，返回200
}

export type TestCaseSubgrade =
  | "0.0"
  | "1.0"
  | "0.9"
  | "0.8333333"
  | "0.8"
  | "0.75"
  | "0.7"
  | "0.6666667"
  | "0.6"
  | "0.5"
  | "0.4"
  | "0.3333333"
  | "0.3"
  | "0.25"
  | "0.2"
  | "0.1666667"
  | "0.1428571"
  | "0.125"
  | "0.1111111"
  | "0.1"
  | "0.05";

export interface TestCase {
  caseid: -1;
  input: string;
  output: string;
  feedback: string;
  /**
   * (0-1之间的值)
   * 通过此测试用例能获得百分之几的分数。
   * 如果作业最高分设为50，此测试用例的成绩设为20%，那么通过测试的学生可以获得10分，没能通过测试的学生只能获得0分。最终成绩是所有测试用例得分的总和。如果该和超过了作业的最高分，那么将以最高分做为最终成绩。
   * 所有测试用例成绩的总和不一定必须为100%
   */
  subgrade: TestCaseSubgrade;
  /**
   * 合法值见 TestCaseSubgrade；常用值: "1.0"、"0.5"、"0.0"
   */
}

export interface TestCaseRequestBody {
  sesskey: string;
  id: number;
  _qf__testcase_form: 1;
  submitbutton: "保存更改";
  TestCase: TestCase[];
}

export interface RequiredQuestion {
  basicInfo: RequiredBasicInfo;
  description: RequiredDescription;
  testCases: TestCase[];
  // 只暴露当前代码实际支持的可选配置，避免为了“类型完整”把实现复杂度也一起拉高
  onlineJudgeSettings?: Partial<OnlineJudgeSettings>;
  submissionSettings?: Partial<SubmissionSettings>;
  gradeSettings?: Partial<GradeSettings>;
  redirectTarget?: RedirectTarget;
}

export interface ImportCredentials {
  moodleSession: string;
}

export interface ImportQuestionResult {
  questionId: number;
  redirectUrl: string;
  questionResponseStatus: number;
  testCaseResponseStatus: number;
}
