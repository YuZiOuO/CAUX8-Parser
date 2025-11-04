interface RequiredBasicInfo {
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
  mform_showadvanced_last: numberBoolean;
}
interface BasicInfo extends RequiredBasicInfo {
  assignmenttype: "onlinejudge";
  type: "onlinejudge";
  conditiongraderepeats?: 1; //语义未知
  conditionfieldrepeats?: 1; //语义未知
  coursemodule: "";
  module: 1;
  modulename: "assignment";
  instance: "";
  add: "assignment";
  update: numberBoolean;
  return: numberBoolean;
  sr: 0; // 语义未知
  _qf__mod_assignment_mod_form: 1; //语义未知
}

interface RequiredDescription {
  /**
   * 描述文本
   * 接受html
   */
  text: string;
}

// 描述
interface Description extends RequiredDescription {
  format: 1; //语义未知
  // itemid: number; // 这个item_id要从上游请求里拿
}
