import axios from "axios";
import { wrapper } from "axios-cookiejar-support";
import { Cookie, CookieJar } from "tough-cookie";
import { constructTestCaseRequestBody } from "./factory/testcase.ts";
import { constructQuestionRequestBody } from "./factory/question.ts";

export async function importQuestion(
  q: RequiredQuestion,
  MoodleSession: string,
  sesskey: string
) {
  const cli = httpClientFactory(MoodleSession);

  const createQuestionEndpoint = "http://page.cau.edu.cn/course/modedit.php";
  const req = cli.post(createQuestionEndpoint, constructQuestionRequestBody(q))
  const res = await req;
  console.log(res.status);
  console.log(res.headers);

  const redirectUrl = ''
  const createTestCaseEndpoint = 'http://page.cau.edu.cn/mod/assignment/type/onlinejudge/testcase.php'
  const req2 = cli.post(createTestCaseEndpoint, constructTestCaseRequestBody(sesskey,redirectUrl,q.testCases))
  const res2 = await req2;
  console.log(res2.status);
  console.log(res2.headers);    
}

function httpClientFactory(moodleSession: string) {
  const jar = new CookieJar();
  jar.setCookie(
    new Cookie({
      key: "MoodleSession",
      value: moodleSession,
      domain: "page.cau.edu.cn",
      path: "/",
      httpOnly: true,
      secure: false,
    }),
    "http://page.cau.edu.cn/"
  );
  const client = wrapper(
    axios.create({
      withCredentials: true,
      jar: jar,
      beforeRedirect: (options, res) => {
        console.log("Redirecting to:", res.headers.location);
      },
    })
  );
  return client;
}
