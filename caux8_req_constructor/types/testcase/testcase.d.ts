interface TestCase {
  caseid: -1;
  input: string;
  output: string;
  feedback: string;
  /**
   * (0-1之间的值)
   * 通过此测试用例能获得百分之几的分数。
   * 如果作业最高分设为50，此测试用例的成绩设为20%，那么通过测试的学生可以获得10分，没能通过测试的学生只能获得0分。最终成绩是所有测试用例得分的总和。如果该和超过了作业的最高分，那么将以最高分做为最终成绩。
   *
   * 所有测试用例成绩的总和并非必须为100%。这样，把总和设成低于100%，可以留一些分数给人工评分；把总和设成高于100%，那么没通过所有的测试用例也有可能获得满分。
   */
  subgrade: '1.0';
  /**
   * <select name="subgrade[0]" id="id_subgrade_0">
	<option value="0.0">无</option>
	<option value="1.0" selected="selected">100%</option>
	<option value="0.9">90%</option>
	<option value="0.8333333">83.33333%</option>
	<option value="0.8">80%</option>
	<option value="0.75">75%</option>
	<option value="0.7">70%</option>
	<option value="0.6666667">66.66667%</option>
	<option value="0.6">60%</option>
	<option value="0.5">50%</option>
	<option value="0.4">40%</option>
	<option value="0.3333333">33.33333%</option>
	<option value="0.3">30%</option>
	<option value="0.25">25%</option>
	<option value="0.2">20%</option>
	<option value="0.1666667">16.66667%</option>
	<option value="0.1428571">14.28571%</option>
	<option value="0.125">12.5%</option>
	<option value="0.1111111">11.11111%</option>
	<option value="0.1">10%</option>
	<option value="0.05">5%</option>
</select>
   */
}

interface TestCaseRequestBody {
  sesskey: string;
  id: number;
  _qf__testcase_form: 1;
  submitbutton: "保存更改";
  TestCase: TestCase[];
}
