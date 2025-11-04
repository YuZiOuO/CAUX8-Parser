interface SubmissionSettings {
    // 在课程页面显示简介
    // showdescription?: number; // 这个字段在请求中没有被发送，原因未知

    // 禁止迟交
    preventlate: numberBoolean;

    // 源文件最大长度
    maxbytes: number;
    /**
     * <option value="20971520">20MB</option>
     * <option value="10485760">10MB</option>
     * <option value="5242880">5MB</option>
     * <option value="2097152">2MB</option>
     * <option value="1048576" selected="selected">1MB</option>
     * <option value="512000">500KB</option>
     * <option value="102400">100KB</option>
     * <option value="51200">50KB</option>
     * <option value="10240">10KB</option>
     * <option value="0">课程上传限制 (20MB)</option>
     */

    // 学生是否可删除作业
    resubmit: numberBoolean;

    // 最多可传几个文件
    var1: number; // 1-20

    // 是否允许备注
    var2: numberBoolean;

    // 在可以提交作业前隐藏作业说明
    var3: numberBoolean;

    // 用Email提醒教师
    emailteachers: number;
}