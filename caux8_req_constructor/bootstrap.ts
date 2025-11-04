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

  // 创建题目
  const createQuestionEndpoint = "http://page.cau.edu.cn/course/modedit.php";
  const req = cli.post(createQuestionEndpoint, constructQuestionRequestBody(q))
  const res = await req;
  console.log(res.status);
  console.log(res.headers);

  // 获取题目ID
  if(res.headers.location === undefined){
    throw new Error("题目可能已经创建，但未获取重定向链接。");
  }
  const url = new URL(res.headers.location);
  console.log(url.href);
  const id = url.searchParams.get("id");
  if(id === null){
    throw new Error("无法从重定向URL中获取题目ID。");
  }

  // 创建测试用例
  const createTestCaseEndpoint = 'http://page.cau.edu.cn/mod/assignment/type/onlinejudge/testcase.php'
  const req2 = cli.post(createTestCaseEndpoint, constructTestCaseRequestBody(sesskey,Number(id),q.testCases))
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
      maxRedirects: 0, // 不自动跟随重定向
      validateStatus: (status) => status >= 200 && status < 400, // 允许重定向响应
    })
  );
  return client;
}
