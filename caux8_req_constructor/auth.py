import re
from typing import Dict, List
import urllib
import requests
from bs4 import BeautifulSoup, Tag

r = requests.request('GET','http://page.cau.edu.cn/course/view.php?id=141',
                     cookies={'MoodleSession':'i0bofjmftis9j6hr6sctsrl166'}
                     )
soup = BeautifulSoup(r.text, 'html.parser')

# 获得logininfo节点
logininfo:Tag = soup.find('div',{'class':'logininfo'})
print(logininfo.text)

# 从节点中获得logout链接
logout_tag:Tag = soup.find('a', string="退出")
if(logout_tag is None):
    exit(1)
logout_link = logout_tag['href']

#从链接中parse出sesskey
query_params = urllib.parse.parse_qs(urllib.parse.urlparse(logout_link).query)
sesskey = query_params.get('sesskey', [None])[0]
print(sesskey)

# 定义 ID 格式的正则表达式：必须以 'section-' 开头，后跟一个或多个数字
ID_PATTERN = re.compile(r'^section-\d+$')

def parse_nested_data(html_string: str) -> List[Dict[str, str]]:
    soup = BeautifulSoup(html_string, 'html.parser')
    results = []

    # ----------------------------------------------------------------------
    # 步骤 1: 使用 CSS 选择器定位所有目标节点
    # 
    # CSS 选择器解释:
    # 1. #page-content     -> 找到 id="page-content" 的元素
    # 2. [class*="section"] -> 找到 class 属性值中包含 "section" 字符串的元素
    # 3. 组合: 找到 #page-content 下，class 中包含 "section" 的所有后代元素。
    # ----------------------------------------------------------------------
    
    # 找到所有包含 'section' class 的目标父节点
    target_sections = soup.select('#page-content *[class*="section"]')

    for section_tag in target_sections:
        # 步骤 2: 提取节点的 id 属性 (如果不存在，则设为 None)
        section_id = section_tag.get('id')
        
        if not section_id or not ID_PATTERN.match(section_id):
            # 如果没有 ID 或者 ID 不符合 'section-数字' 的格式，则跳过本次循环
            continue

        # 步骤 3: 查找嵌套的子节点
        # 在当前的 section_tag 内部，查找 class="content" 的子节点
        content_tag = section_tag.find('div', class_='content')
        
        section_name_text = None
        
        if content_tag:
            # 在 content_tag 内部，查找 class="sectionname" 的子节点
            section_name_tag = content_tag.find(class_='sectionname')
            
            if section_name_tag:
                # 提取该节点的纯文本内容
                section_name_text = section_name_tag.text

        # 组织结果
        results.append({
            "id": section_id,
            "section_name": section_name_text
        })
        
    return results

# 运行解析
parsed_data = parse_nested_data(r.text)

print("--- 解析结果 ---")
for item in parsed_data:
    print(item)