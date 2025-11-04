interface AvailabilityTimeOption {
    day: number; // 1-31
    month: number; // 1-12
    year: number; // 1970-2032
    hour: number; // 00-23
    minute: number; // 00-55 只能为5的倍数
    enabled: number; // 是否启用
}

// 可用性时间
interface AvailabilityTime {
    // 开放时间
    timeavailable?: AvailabilityTimeOption;

    // 截止时间
    timedue?: AvailabilityTimeOption;
}


// 提交设置
interface SubmissionSettings {
    // 在课程页面显示简介
    // showdescription?: number; // 这个字段在请求中没有被发送，原因未知

    // 禁止迟交
    preventlate?: number;

    // 源文件最大长度
    maxbytes?: number;
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
    resubmit?: number;

    // 最多可传几个文件
    var1?: number; // 1-20

    // 是否允许备注
    var2?: number;

    // 在可以提交作业前隐藏作业说明
    var3?: number;

    // 用Email提醒教师
    emailteachers?: number;
}

// 成绩设置
interface GradeSettings {
    // 成绩
    grade?: number; // 0=没有成绩 -1=量表 1-100

    // 评分方式
    advancedgradingmethod_submission?: string; // "" = 直接打分,guide = 评分指南,rubric = 量规

    // 成绩类别
    gradecat?: number; // 168 = 未分类
}

// 通用模块设置
interface CommonModuleSettings {
    // 小组模式
    groupmode?: number; // 0=无小组 1=分隔小组 2=可视小组

    // 可见
    visible?: number;

    // ID号
    /**
     * ID号可以在成绩计算公式中唯一标识一个活动。 如果这个活动与任何成绩计算公式无关，那么它的ID号可以为空。
     * ID号也可以在成绩薄中设定，不过只能在活动设置页面里编辑。
     */
    cmidnumber?: string;
}

// 访问限制
interface AccessRestrictions {
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
     * <option value="0">（无）</option>
     * <option value="aim">AIM号码</option>
     * <option value="icq">ICQ号码</option>
     * <option value="msn">MSN号码</option>
     * <option value="skype">Skype号码</option>
     * <option value="yahoo">Yahoo号码</option>
     * <option value="firstname">名</option>
     * <option value="country">国家或地区</option>
     * <option value="address">地址</option>
     * <option value="lastname">姓氏</option>
     * <option value="idnumber">学号</option>
     * <option value="city">市/县</option>
     * <option value="phone2">手机</option>
     * <option value="institution">机构</option>
     * <option value="email">电子邮件地址</option>
     * <option value="phone1">电话</option>
     * <option value="department">系别</option>
     * <option value="url">网页</option>
     */
    conditionfieldgroup_0_conditionfieldoperator?: string;
    /**
     * <option value="contains">包含</option>
     * <option value="doesnotcontain">不包含</option>
     * <option value="isequalto">等于</option>
     * <option value="startswith">以...开始</option>
     * <option value="endswith">以...结束</option>
     * <option value="isempty">为空</option>
     * <option value="isnotempty">is not empty</option>
     */
    conditionfieldgroup_0_conditionfieldvalue?: string;

    // 活动可用之前
    showavailability?: number; // 1 = 活动以暗色显示，并显示受限信息,0 = 完全隐藏活动
}

// 其他
interface Other {
    // 不知道为什么会有这个
    submitbutton2?: string;
}

