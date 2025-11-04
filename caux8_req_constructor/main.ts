import { importQuestion } from "./bootstrap.ts"

const q: RequiredQuestion = {
    basicInfo:{
        name: "test_q",
        course: 141,
        section: 10,
        mform_showadvanced_last: 0,
        sesskey:'T72pRCtqOa'
    },
    description:{text: "test question"},
    testCases: []
}

await importQuestion(q,'76iuuf6rr0tvrgcq23g2leo0b2','T72pRCtqOa')