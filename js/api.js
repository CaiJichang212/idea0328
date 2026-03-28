// API调用功能

// 缓存机制
const imageCache = new Map();
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24小时缓存

// 生成图片的哈希值作为缓存键
function generateImageHash(imageData) {
    // 简单的哈希函数，实际应用中可以使用更复杂的算法
    let hash = 0;
    for (let i = 0; i < imageData.length; i++) {
        const char = imageData.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // 转换为32位整数
    }
    return hash.toString();
}

// 优化图片大小
function optimizeImage(imageData) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = function() {
            // 快速检查图片大小，如果已经很小则直接返回
            if (imageData.length < 500000) { // 小于500KB
                resolve(imageData);
                return;
            }
            
            // 创建canvas并设置最大尺寸
            const maxWidth = 800;
            const maxHeight = 600;
            let width = img.width;
            let height = img.height;
            
            // 保持比例缩放
            if (width > maxWidth) {
                height = Math.round((height * maxWidth) / width);
                width = maxWidth;
            }
            if (height > maxHeight) {
                width = Math.round((width * maxHeight) / height);
                height = maxHeight;
            }
            
            // 创建canvas并绘制
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            
            // 优化绘制质量
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'medium';
            
            ctx.drawImage(img, 0, 0, width, height);
            
            // 根据图片大小动态调整质量
            let quality = 0.7;
            if (width < 400 || height < 300) {
                quality = 0.8;
            } else if (width > 600 || height > 450) {
                quality = 0.6;
            }
            
            // 转换为base64
            const optimizedData = canvas.toDataURL('image/jpeg', quality);
            
            // 清理资源
            img.src = '';
            
            resolve(optimizedData);
        };
        img.onerror = function() {
            // 图片加载失败时，返回原始数据
            resolve(imageData);
        };
        img.src = imageData;
    });
}

// Qwen3.5-122B-A10B模型API调用
async function callQwenAPI(imageData) {
    const MAX_RETRIES = 2;
    let retries = 0;
    
    while (retries <= MAX_RETRIES) {
        try {
            // 优化图片大小
            const optimizedImage = await optimizeImage(imageData);
            
            // 生成缓存键
            const cacheKey = generateImageHash(optimizedImage);
            
            // 检查缓存
            const cached = imageCache.get(cacheKey);
            if (cached && (Date.now() - cached.timestamp) < CACHE_EXPIRY) {
                console.log('使用缓存结果');
                return cached.data;
            }
            
            const response = await fetch('https://api-inference.modelscope.cn/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ms-c81078dc-06a3-4e13-9283-6b018b363da9'
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

            if (!response.ok) {
                throw new Error(`API调用失败: ${response.status}`);
            }

            const data = await response.json();
            
            // 缓存结果
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
                // 指数退避策略
                await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retries)));
            } else {
                throw error;
            }
        }
    }
}

// 解析模型返回的结果
function parseQwenResponse(response) {
    try {
        // 检查响应结构
        if (!response.choices || !response.choices[0] || !response.choices[0].message || !response.choices[0].message.content) {
            throw new Error('响应结构不正确');
        }

        const content = response.choices[0].message.content;
        
        // 提取JSON部分
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('无法提取JSON数据');
        }

        const jsonString = jsonMatch[0];
        const parsedData = JSON.parse(jsonString);

        // 计算健康评分等级
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

        // 构建返回对象
        return {
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
    } catch (error) {
        console.error('解析响应错误:', error);
        // 返回默认数据，确保应用不会崩溃
        return generateMockData();
    }
}
