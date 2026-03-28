export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { image, prompt } = req.body;
        
        if (!image) {
            return res.status(400).json({ error: 'Image data is required' });
        }

        const apiKey = process.env.MODELSCOPE_API_KEY;
        
        if (!apiKey) {
            console.error('MODELSCOPE_API_KEY environment variable is not set');
            return res.status(500).json({ error: 'API key not configured' });
        }

        const defaultPrompt = prompt || '请仔细识别图片中的包装食物，重点提取配料表、营养成分表等关键信息。请按照以下要求分析：1. 准确识别食品名称；2. 完整提取配料表所有成分；3. 分析营养成分，包括热量、蛋白质、脂肪、碳水化合物、纤维素的具体数值；4. 根据配料表和营养成分，计算0-10分的健康评分（10分为最健康）；5. 为减脂人群提供具体的饮食建议；6. 推荐2-3个低卡替代产品。请严格以JSON格式返回结果，包含以下字段：name（食品名称）、score（健康评分）、ingredients（配料表数组）、nutrition（营养成分对象，包含calories、protein、fat、carbs、fiber字段）、advice（建议字符串）、alternatives（替代产品数组，每个对象包含name、calories、description字段）。请确保JSON格式正确，不要包含任何额外文本。';

        const response = await fetch('https://api-inference.modelscope.cn/v1/chat/completions', {
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
                        text: defaultPrompt
                    }, {
                        type: 'image_url',
                        image_url: {
                            url: image
                        }
                    }]
                }],
                stream: false
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('ModelScope API error:', errorText);
            return res.status(response.status).json({ 
                error: 'API call failed', 
                details: errorText 
            });
        }

        const data = await response.json();
        
        res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');
        
        return res.status(200).json(data);
        
    } catch (error) {
        console.error('API proxy error:', error);
        return res.status(500).json({ 
            error: 'Internal server error', 
            message: error.message 
        });
    }
}
