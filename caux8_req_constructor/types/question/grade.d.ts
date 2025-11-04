interface GradeSettings {
    // 成绩
    grade: number; // 0=没有成绩 -1=量表 1-100

    // 评分方式
    advancedgradingmethod_submission: string; // "" = 直接打分,guide = 评分指南,rubric = 量规

    // 成绩类别
    gradecat: number; // 168 = 未分类
}