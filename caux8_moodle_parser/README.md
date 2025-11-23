该仓库包含将模拟coderunner问题的Python对象导出至"moodle xml"格式的脚本

# 使用方法
安装该Python包:
```shell
pip install caux8_moodle_parser
```
或手动安装:
```shell
pip install git+https://github.com/YuZiOuO/CAUX8-Parser.git
```
接下来有两种方法：
1. 已经支持的格式:调用parse_xxx()函数,填入问题所在的文件夹,
该函数会将里面所有题目导出至同目录下的EXPORT.xml中
2. 手动导入:手动构造question对象,填入重要的字段, 然后调用导出函数export_to()

# 项目结构
```text
CAUX8-Parser
|---export.py   # 导出模块
|       export_to(str,list[question]) -> None: 
|               # 传入一个question的列表,写入导出结果到给定文件
|       export_single_question_to(str,question) -> None: 
|               # 同上,导出单一question对象
|---main.py
|---question.py # 定义了可以用于导出的类moodle-question对象
|---util.py     # 工具类与枚举类
|
\---ext_fmt     # 扩展格式导出模块,支持fps和一本通等格式
|       fps_xml.py
|       ybt.py
|       *.py    # 为各种格式的导出模块
|       |   bootstrap(str) -> None: 
                # 给定含给定格式的题目的文件夹,导出其中所有的题目至同目录下的EXPORT.xml
```


# 一些笔记

## 对question.py中对象的说明
question对象表示一个coderunner问题,对于其中的任何字段以及字典:
1. 若初始值不为None,则该字段(或键值对)是必须的,并且已经被设定为默认值。
2. 若初始值为None,则该字段(或键值对)是可选的。
3. 若初始值为tag对象或text对象,或者嵌套的tag(text())对象,则其必须被设定为对应的同种对象。
4. 如果在注释中提到“可选的值定义与枚举类中”,则该字段的值必须是枚举类中的值。如:
   ```python
   # @var string The coderunner type.
   # coderunner类型
   # 可选的类型位于枚举类中
   'coderunnertype': None
   ```
   ```python
   from parser.question import question
   from parser.util import coderunnertype
   q = question()
   q.attr["coderunnertype"] = coderunnertype.cpp_function
   ```

## 有关moodlePHP源码

### 有关导入问题的函数

xml导出的入口位于question/bank/exporttoxml/exportone.php中  
导入问题的入口位于question/importquestions/import.php中,调用的importpreprocess()是qformat_default中的默认方法

### 关于IDE无法跳转的解决方案

这些文件使用了大量的动态加载类与函数,如
```php
$classname = 'qformat_' . $form->format;
$qformat = new $classname();
```
或者
```php
public function try_importing_using_qtypes($data, $question = null, $extra = null,
        $qtypehint = '') {

    // work out what format we are using
    $formatname = substr(get_class($this), strlen('qformat_'));
    $methodname = "import_from_{$formatname}";
```
这会导致IDE的跳转功能失效,使用搜索函数名来解决这个问题.

# Moodle内部导入coderunner问题的逻辑

导入coderunner问题的步骤:
1. question标签的type attr必须为coderunner,否则跳过。
2. 调用qformat_xml的import_header函数,其执行以下操作:
   - 初始化空问题q = defaultquestion()。
   - 将name标签的text子标签的value赋值给q.name。
   - import_text_with_files()获得整个questiontext标签和generalfeedback标签,并赋值。这些标签含有text子标签,format attr和可选的itemid子标签(实际上似乎不使用)。
   - 将idnumber标签的value赋值给q.idnumber,没有则为null。
   - 获得defaultmark和penalty。
   - 获得tags和coursetags作为数组。
3. 如果iscombinatortemplate标签不为空,并且q.iscombinatortemplate已被赋值,则忽略该问题的其他字段。
4. 在xml寻找以下extra字段,如果该字段存在则直接复制,不存在则以newdefaults中的值为默认值,若newdefault中不存在则赋值为空字符串。
    ```php
    public function extra_question_fields() {
        return ['coderunnertype',
            'prototypetype',
            'allornothing',
            'penaltyregime',
            'precheck',
            'hidecheck',
            'showsource',
            'answerboxlines',
            'answerboxcolumns', // Defunct.
            'answerpreload',
            'globalextra',
            'useace',
            'resultcolumns',
            'template',
            'iscombinatortemplate',
            'allowmultiplestdins',
            'answer',
            'validateonsave',
            'testsplitterre',
            'language',
            'acelang',
            'sandbox',
            'grader',
            'cputimelimitsecs',
            'memlimitmb',
            'sandboxparams',
            'templateparams',
            'hoisttemplateparams',
            'extractcodefromjson',
            'templateparamslang',
            'templateparamsevalpertry',
            'templateparamsevald',
            'twigall',
            'uiplugin',
            'uiparameters',
            'attachments',
            'attachmentsrequired',
            'maxfilesize',
            'filenamesregex',
            'filenamesexplain',
            'displayfeedback',
            'giveupallowed',
            'prototypeextra',
        ];
    }
   
    $newdefaults = [
        'allornothing' => 1,
        'precheck' => 0,
        'answerboxlines' => 15,
        'answerboxcolumns' => 90,
        'validateonsave' => 1,
        'answerpreload' => '',
        'globalextra' => '',
        'useace' => 1,
        'iscombinatortemplate' => null, // Probably unnecessary?
        'template' => null, // Probably unnecessary?
        'templateparamslang' => 'twig',
        'templateparamsevalpertry' => 0,
        'templateparamsevald' => null,
        'uiparameters' => null,
        'hidecheck' => 0,
        'attachments' => 0,
        'extractcodefromjson' => 1,
        'giveupallowed' => 0,
    ];
    ```
5. 导入所有testcases,每一个testcase其包括以下字段:
   - 必选的testcode,stdin,expected,extra字段,内容在其text子标签中
   - 可选的mark字段,默认值为1.0
   - 可选的display字段,默认值为"SHOW",有两种设置方法:
     - 将hidden标签设置为"1"会使display被设置为"HIDE"
     - 否则,读取display标签的text子标签,并赋值给该字段
   - 可选的hiderestiffail字段,默认值为0,可选值为0或1
   - 可选的testtype字段,默认值为0,可选值为整数
   - 必须的useasexample字段,默认值为0,可选值为0或1
6. testcases还可以包含以下字段(在testcases标签下,对于所有testcase)
   - 可选的file标签,将被导入到datafile字段,必须为array才可以被导入
   - 可选的anwserfiles标签,其子标签file的内容将被导入至sampleanswerattachments字段中
