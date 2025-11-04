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


