class testcases_request_body:
    """
    测试用例上传请求体类
    对应抓取到的表单数据格式
    """
    # 基础参数
    boundary_repeats: int = 5
    id: int = 38222  # 题目ID，从页面或上游请求获取
    sesskey: str = "dKBfkNkji1"  # 登录会话密钥，动态获取
    _qf__testcase_form: int = 1
    submitbutton: str = "保存更改"

    # 测试用例1（索引0）
    caseid_0: int = -1  # 测试用例ID，-1表示新增
    subgrade_0: float = 1.0  # 分值权重
    input_0: str = "1 2"  # 输入数据
    output_0: str = "3"  # 预期输出
    feedback_0: str = ""  # 反馈信息

    # 测试用例2（索引1）
    caseid_1: int = -1
    subgrade_1: float = 0.0
    input_1: str = ""
    output_1: str = ""
    feedback_1: str = ""

    # 测试用例3（索引2）
    caseid_2: int = -1
    subgrade_2: float = 0.0
    input_2: str = ""
    output_2: str = ""
    feedback_2: str = ""

    # 测试用例4（索引3）
    caseid_3: int = -1
    subgrade_3: float = 0.0
    input_3: str = ""
    output_3: str = ""
    feedback_3: str = ""

    # 测试用例5（索引4）
    caseid_4: int = -1
    subgrade_4: float = 0.0
    input_4: str = ""
    output_4: str = ""
    feedback_4: str = ""
    # 测试用例列表，默认5个
    testcases: List[TestCase] = field(default_factory=lambda: [
        TestCase(subgrade=1.0, input="1 2", output="3"),  # 第一个测试用例有默认值
        TestCase(),
        TestCase(),
        TestCase(),
        TestCase()
    ])
    def to_form_data(self) -> dict:
        """
        转换为表单数据字典，用于发送POST请求
        将类属性映射为原始请求中的字段格式（如caseid_0 -> caseid[0]）
        """
        form_data = {
            "boundary_repeats": self.boundary_repeats,
            "id": self.id,
            "sesskey": self.sesskey,
            "_qf__testcase_form": self._qf__testcase_form,
            "submitbutton": self.submitbutton
        }

        # 映射测试用例字段（处理索引0-4）
        for i in range(self.MAX_TEST_CASES):
            form_data[f"caseid[{i}]"] = getattr(self, f"caseid_{i}")
            form_data[f"subgrade[{i}]"] = getattr(self, f"subgrade_{i}")
            form_data[f"input[{i}]"] = getattr(self, f"input_{i}")
            form_data[f"output[{i}]"] = getattr(self, f"output_{i}")
            form_data[f"feedback[{i}]"] = getattr(self, f"feedback_{i}")

        return form_data
