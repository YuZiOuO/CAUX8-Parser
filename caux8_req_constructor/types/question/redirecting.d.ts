interface RedirectSettings {
    submitbutton?: '保存并预览'; // 如果存在该字段，重定向跳转到题目页
    submitbutton2?: '保存并返回课程'; // 如果存在该字段，重定向跳转到课程页
    // 如果都不存在，返回200
}