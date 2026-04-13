import { ENDPOINTS, CAU_BASE_URL } from "./config.js";
import { constructQuestionRequestBody } from "./factory/question.js";
import { constructTestCaseRequestBody } from "./factory/testcase.js";
import { createHttpClient } from "./http-client.js";
import type {
  ImportCredentials,
  ImportQuestionResult,
  RequiredQuestion,
} from "./types.js";

/**
 * 顶层封装，给定题目数据和 MoodleSession，完成题目导入。
 * @param q 题目数据
 * @param credentials 登录凭证
 */
export async function importQuestion(
  q: RequiredQuestion,
  credentials: ImportCredentials
): Promise<ImportQuestionResult> {
  const cli = createHttpClient(credentials.moodleSession);

  // 创建题目
  const res = await cli.post(
    ENDPOINTS.createQuestion,
    constructQuestionRequestBody(q)
  );

  // 获取题目ID
  if (res.headers.location === undefined) {
    throw new Error("题目可能已经创建，但未获取重定向链接。");
  }
  const url = new URL(res.headers.location, CAU_BASE_URL);
  const id = url.searchParams.get("id");
  if (id === null) {
    throw new Error("无法从重定向URL中获取题目ID。");
  }
  const questionId = Number(id);
  if (Number.isNaN(questionId)) {
    throw new Error(`题目ID不是有效数字: ${id}`);
  }

  // 创建测试用例
  const res2 = await cli.post(
    ENDPOINTS.createTestCase,
    constructTestCaseRequestBody(q.basicInfo.sesskey, questionId, q.testCases)
  );

  return {
    questionId,
    redirectUrl: url.toString(),
    questionResponseStatus: res.status,
    testCaseResponseStatus: res2.status,
  };
}
