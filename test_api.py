#!/usr/bin/env python3
import base64
import json
import requests

# 读取图片
image_path = '/Users/lzc/Pictures/测试1-辣条.jpg'
with open(image_path, 'rb') as f:
    image_data = base64.b64encode(f.read()).decode('utf-8')

print(f"图片大小: {len(image_data)} bytes")

# 准备请求
url = 'https://api-inference.modelscope.cn/v1/chat/completions'
headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ms-c81078dc-06a3-4e13-9283-6b018b363da9'
}

payload = {
    'model': 'Qwen/Qwen3.5-122B-A10B',
    'messages': [{
        'role': 'user',
        'content': [{
            'type': 'text',
            'text': '请仔细识别图片中的包装食物，重点提取配料表、营养成分表等关键信息。请按照以下要求分析：1. 准确识别食品名称；2. 完整提取配料表所有成分；3. 分析营养成分，包括热量、蛋白质、脂肪、碳水化合物、纤维素的具体数值；4. 根据配料表和营养成分，计算0-10分的健康评分（10分为最健康）；5. 为减脂人群提供具体的饮食建议；6. 推荐2-3个低卡替代产品。请严格以JSON格式返回结果，包含以下字段：name（食品名称）、score（健康评分）、ingredients（配料表数组）、nutrition（营养成分对象，包含calories、protein、fat、carbs、fiber字段）、advice（建议字符串）、alternatives（替代产品数组，每个对象包含name、calories、description字段）。请确保JSON格式正确，不要包含任何额外文本。'
        }, {
            'type': 'image_url',
            'image_url': {
                'url': f'data:image/jpeg;base64,{image_data}'
            }
        }]
    }],
    'stream': False
}

print("开始调用API...")
try:
    response = requests.post(url, headers=headers, json=payload, timeout=60)
    print(f"响应状态: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print("\n=== API响应 ===")
        print(json.dumps(data, indent=2, ensure_ascii=False))
        
        # 解析内容
        if 'choices' in data and len(data['choices']) > 0:
            content = data['choices'][0]['message']['content']
            print("\n=== 识别内容 ===")
            print(content)
            
            # 尝试提取JSON
            import re
            json_match = re.search(r'\{[\s\S]*\}', content)
            if json_match:
                try:
                    parsed = json.loads(json_match.group())
                    print("\n=== 解析的JSON数据 ===")
                    print(json.dumps(parsed, indent=2, ensure_ascii=False))
                except json.JSONDecodeError as e:
                    print(f"JSON解析错误: {e}")
            else:
                print("未找到JSON数据")
    else:
        print(f"错误: {response.text}")
except Exception as e:
    print(f"请求失败: {e}")