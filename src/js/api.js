// API模块
import { optimizeImage, generateImageHash, generateMockData } from './utils.js';

const imageCache = new Map();
const CACHE_EXPIRY = 24 * 60 * 60 * 1000;

function isVercelEnvironment() {
    return window.location.hostname !== 'localhost' && 
           window.location.hostname !== '127.0.0.1' &&
           !window.location.hostname.includes('local');
}

function getEnvConfig() {
    const envConfig = window.ENV_CONFIG || {};
    const vercelEnvVars = {
        MODELSCOPE_API_KEY: typeof MODELSCOPE_API_KEY !== 'undefined' ? MODELSCOPE_API_KEY : null,
        API_BASE_URL: typeof API_BASE_URL !== 'undefined' ? API_BASE_URL : null,
    };
    return {
        MODELSCOPE_API_KEY: envConfig.MODELSCOPE_API_KEY || vercelEnvVars.MODELSCOPE_API_KEY || null,
        API_BASE_URL: envConfig.API_BASE_URL || vercelEnvVars.API_BASE_URL || 'https://api-inference.modelscope.cn/v1/chat/completions',
    };
}

export async function callQwenAPI(imageData) {
    const MAX_RETRIES = 2;
    let retries = 0;

    while (retries <= MAX_RETRIES) {
        try {
            const optimizedImage = await optimizeImage(imageData);

            const cacheKey = generateImageHash(optimizedImage);

            const cached = imageCache.get(cacheKey);
            if (cached && (Date.now() - cached.timestamp) < CACHE_EXPIRY) {
                console.log('使用缓存结果');
                return cached.data;
            }

            console.log('开始API调用...');
            console.log('运行环境:', isVercelEnvironment() ? 'Vercel' : '本地');

            let response;

            if (isVercelEnvironment()) {
                response = await fetch('/api/analyze', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        image: optimizedImage
                    })
                });
            } else {
                const envConfig = getEnvConfig();
                const apiKey = envConfig.MODELSCOPE_API_KEY;

                if (!apiKey || apiKey === 'your_modelscope_api_key_here') {
                    throw new Error('请先配置环境变量：在 env-config.js 中设置您的 MODELSCOPE_API_KEY');
                }

                const apiBaseUrl = envConfig.API_BASE_URL;

                response = await fetch(apiBaseUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiKey}`
                    },
                    body: JSON.stringify({
                        model: 'Qwen/Qwen3.5-122B-A10B',
                        messages: [{
                            role: 'user',
                            content: [{
                                type: 'text',
                                text: '请仔细识别图片中的包装食物，重点提取配料表、营养成分表等关键信息。请按照以下要求分析：1. 准确识别食品名称；2. 完整提取配料表所有成分；3. 分析营养成分，包括热量、蛋白质、脂肪、碳水化合物、纤维素的具体数值；4. 根据配料表和营养成分，计算0-10分的健康评分（10分为最健康）；5. 为减脂人群提供具体的饮食建议；6. 推荐2-3个低卡替代产品。请严格以JSON格式返回结果，包含以下字段：name（食品名称）、score（健康评分）、ingredients（配料表数组）、nutrition（营养成分对象，包含calories、protein、fat、carbs、fiber字段）、advice（建议字符串）、alternatives（替代产品数组，每个对象包含name、calories、description字段）。请确保JSON格式正确，不要包含任何额外文本。'
                            }, {
                                type: 'image_url',
                                image_url: {
                                    url: optimizedImage
                                }
                            }]
                        }],
                        stream: false
                    })
                });
            }

            console.log('API响应状态:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('API错误详情:', errorText);
                throw new Error(`API调用失败: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            console.log('API响应数据:', data);
            
            imageCache.set(cacheKey, {
                data: data,
                timestamp: Date.now()
            });
            
            return data;
        } catch (error) {
            console.error(`API调用错误 (尝试 ${retries + 1}/${MAX_RETRIES + 1}):`, error);
            
            if (retries < MAX_RETRIES) {
                retries++;
                console.log(`等待后重试... (${retries}/${MAX_RETRIES})`);
                await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retries)));
            } else {
                throw error;
            }
        }
    }
}

export function parseQwenResponse(response) {
    try {
        console.log('开始解析API响应...');
        console.log('响应数据:', response);
        
        if (!response.choices || !response.choices[0] || !response.choices[0].message || !response.choices[0].message.content) {
            throw new Error('响应结构不正确');
        }

        const content = response.choices[0].message.content;
        console.log('响应内容:', content);
        
        let cleanedContent = content;
        
        if (content.includes('```json')) {
            cleanedContent = content.replace(/```json\s*/, '').replace(/\s*```\s*$/, '');
        } else if (content.includes('```')) {
            cleanedContent = content.replace(/```\s*/, '').replace(/\s*```\s*$/, '');
        }
        
        console.log('清理后的内容:', cleanedContent);
        
        const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('无法提取JSON数据');
        }

        const jsonString = jsonMatch[0];
        console.log('提取的JSON字符串:', jsonString);
        
        const parsedData = JSON.parse(jsonString);
        console.log('解析后的JSON数据:', parsedData);

        let scoreLabel, scoreClass;
        if (parsedData.score >= 8) {
            scoreLabel = '优秀';
            scoreClass = 'score-excellent';
        } else if (parsedData.score >= 6) {
            scoreLabel = '良好';
            scoreClass = 'score-good';
        } else if (parsedData.score >= 4) {
            scoreLabel = '一般';
            scoreClass = 'score-average';
        } else {
            scoreLabel = '较差';
            scoreClass = 'score-poor';
        }

        const result = {
            name: parsedData.name || '未知食品',
            score: parsedData.score || 0,
            scoreLabel: scoreLabel,
            scoreClass: scoreClass,
            nutrition: parsedData.nutrition || {
                calories: 0,
                protein: 0,
                fat: 0,
                carbs: 0,
                fiber: 0
            },
            ingredients: parsedData.ingredients || [],
            advice: parsedData.advice || '无法提供建议',
            alternatives: parsedData.alternatives || [],
            date: new Date().toLocaleString()
        };
        
        console.log('解析结果:', result);
        return result;
    } catch (error) {
        console.error('解析响应错误:', error);
        const mockData = generateMockData();
        console.log('使用模拟数据:', mockData);
        return mockData;
    }
}
