export function appendDefaultBasicInfo(rinfo:RequiredBasicInfo, form: FormData): FormData{
    const info:BasicInfo = {
        assignmenttype: "onlinejudge",
        type: "onlinejudge",
        mform_showadvanced_last: 0,
        conditiongraderepeats: 1,
        conditionfieldrepeats: 1,
        course: rinfo.course,
        coursemodule: "",
        section: rinfo.section,
        module: 1,
        modulename: "assignment",
        instance: "",
        add: "assignment",
        update: 0,
        return: 0,
        sr: 0,
        sesskey: rinfo.sesskey,
        _qf__mod_assignment_mod_form: 1,
        name: rinfo.name,
    }

    for (const [key, value] of Object.entries(info)) {
        form.append(key, value.toString());
    }   
    return form;
}

export function appendDefaultDescription(text: string,form:FormData): FormData {
    const description: Description = {
        text: text,
        format: 1,
    }

    for (const [key, value] of Object.entries(description)) {
        form.append(`introeditor[${key}]`, value.toString());
    }
    return form;
}

export function appendDefaultOJSettings(form: FormData): FormData {
    const ojSettings: OnlineJudgeSettings = {
        language: "1111_ideone",
        ratiope: 1.0,
        cpulimit: 2,
        memlimit: 67108864,
        compileonly: 0,
        preamble: "",
        postamble: "",
        forbiddenwords: "",
    }

    for (const [key, value] of Object.entries(ojSettings)) {
        form.append(key, value.toString());
    }
    return form;
}