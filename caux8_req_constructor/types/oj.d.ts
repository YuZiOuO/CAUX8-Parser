// 在线评测设置
interface OnlineJudgeSettings {
    /**
     * 编程语言
     */
    language?: string;
    /**
     * <select name="language" id="id_language">
     *     <option value="13_ideone">Assembler (masm, studybar.cau.edu.cn)</option>
     *     <option value="1_ideone">C and C++ (TDM-GCC4.8.1,xp32)</option>
     *     <option value="11_ideone">C and C++ (VC6, xp32)</option>
     *     <option value="1117_ideone">C and C++ (g++ -std=c++17  ubuntu 64bit)</option>
     *     <option value="1111_ideone" selected="selected">C and C++ (g++-5 -std=c++11 ubuntu 32)</option>
     *     <option value="12_ideone">C and C++ (vs2015, win7 32bit)</option>
     *     <option value="1113_ideone">C#  VS2015 (win7 32)</option>
     *     <option value="1112_ideone">C#  mono4.0 (ubuntu 32)</option>
     *     <option value="10_ideone">Java (JDK 1.7.0_25, xp32)</option>
     *     <option value="101_ideone">Java (open JDK 1.7.0_121, ubuntu32)</option>
     *     <option value="1011_ideone">Java (open JDK 1.7.0_121, ubuntu32, wallclock)</option>
     *     <option value="4_ideone">Python (python 2.7. win )</option>
     *     <option value="116_ideone">Python 3 (python-3.5, win)</option>
     *     <option value="1116_ideone">Python3 (python-3.10, ubuntu,64bit )</option>
     *     <option value="115_ideone">vPython (python-2.7, win32,64bit )</option>
     *     <option value="2000_ideone">web test (ubuntu 32)</option>
     * </select>
     */

    /**
     * 格式错误得分比例
     */
    ratiope?: number;
    /**
     * <option value="0.0">无</option>
     * <option value="1.0" selected="selected">100%</option>
     * <option value="0.9">90%</option>
     * <option value="0.8333333">83.33333%</option>
     * <option value="0.8">80%</option>
     * <option value="0.75">75%</option>
     * <option value="0.7">70%</option>
     * <option value="0.6666667">66.66667%</option>
     * <option value="0.6">60%</option>
     * <option value="0.5">50%</option>
     * <option value="0.4">40%</option>
     * <option value="0.3333333">33.33333%</option>
     * <option value="0.3">30%</option>
     * <option value="0.25">25%</option>
     * <option value="0.2">20%</option>
     * <option value="0.1666667">16.66667%</option>
     * <option value="0.1428571">14.28571%</option>
     * <option value="0.125">12.5%</option>
     * <option value="0.1111111">11.11111%</option>
     * <option value="0.1">10%</option>
     * <option value="0.05">5%</option>
     */

    /**
     * CPU使用时间上限
     * 单位:秒
     */
    cpulimit?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
    // 内存最多可用
    memlimit?: number;
    /**
     * <option value="1048576">1MB</option>
     * <option value="2097152">2MB</option>
     * <option value="4194304">4MB</option>
     * <option value="8388608">8MB</option>
     * <option value="16777216">16MB</option>
     * <option value="33554432">32MB</option>
     * <option value="67108864" selected="selected">64MB</option>
     * <option value="134217728">128MB</option>
     * <option value="268435456">256MB</option>
     */

    // 只编译
    compileonly: numberBoolean;

    // 前缀
    preamble?: string;
    // 后缀
    postamble?: string;

    // 学生代码中禁止出现的词，一行一个,分号结束，注意空格是有效的，比如"or" 和" or " 是不同的，后者是一个独立的词，前者是任何匹配的串，哪怕在for中，都不行
    forbiddenwords?: string;
}