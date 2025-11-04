export function appendBasicInfo(info:RequiredBasicInfo, form: FormData): FormData{
    const hiddenInfo:BasicInfo = {
        assignmenttype: "onlinejudge",
        type: "onlinejudge",
        mform_showadvanced_last: 0,
        conditiongraderepeats: 1,
        conditionfieldrepeats: 1,
        course: info.course,
        coursemodule: "",
        section: info.section,
        module: 1,
        modulename: "assignment",
        instance: "",
        add: "assignment",
        update: 0,
        return: 0,
        sr: 0,
        sesskey: info.sesskey,
        _qf__mod_assignment_mod_form: 1,
        name: info.name,
    }

    for (const [key, value] of Object.entries(hiddenInfo)) {
        form.append(key, value.toString());
    }   
    return form;
}

export function appendDescription(text: string,form:FormData): FormData {
    const description: Description = {
        text: text,
        format: 1,
    }

    for (const [key, value] of Object.entries(description)) {
        form.append(`introeditor[${key}]`, value.toString());
    }
    return form;
}

export function appendOJSettings(form: FormData, override?: Partial<OnlineJudgeSettings>): FormData {
    const settings: OnlineJudgeSettings = {
        language: "1111_ideone",
        ratiope: 1.0,
        cpulimit: 2,
        memlimit: 67108864,
        compileonly: 0,
        preamble: "",
        postamble: "",
        forbiddenwords: "",
    }

    const overridedSettings = { ...settings, ...override };

    for (const [key, value] of Object.entries(overridedSettings)) {
        form.append(key, value.toString());
    }
    return form;
}

export function appendRedirectSettings(form: FormData): FormData {
    // 默认重定向到题目页，方便取回题目id
    form.append('submitbutton','保存并预览');
    return form;
}

export function appendSubmissionSettings( form: FormData,override?: Partial<SubmissionSettings>): FormData {
    const settings: SubmissionSettings = {
        preventlate: 0,
        maxbytes: 20971520,
        resubmit: 1,
        var1: 20,
        var2: 1,
        var3: 1,
        emailteachers: 0,
    }

    const overridedSettings = { ...settings, ...override };

    for (const [key, value] of Object.entries(overridedSettings)) {
        form.append(key, value.toString());
    }
    return form;
}

export function appendGradeSettings(form: FormData, override?: Partial<GradeSettings>): FormData {
    const settings: GradeSettings = {
        grade: 100,
        advancedgradingmethod_submission: "",
        gradecat: 168,
    }

    const overridedSettings = { ...settings, ...override };

    for (const [key, value] of Object.entries(overridedSettings)) {
        form.append(key, value.toString());
    }
    return form;
}