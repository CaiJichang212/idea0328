// 工具函数模块

export function generateImageHash(imageData) {
    let hash = 0;
    for (let i = 0; i < imageData.length; i++) {
        const char = imageData.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString();
}

export function optimizeImage(imageData) {
    return new Promise((resolve) => {
        console.log('开始优化图片...');
        console.log('原始图片数据长度:', imageData.length);
        
        if (!imageData || typeof imageData !== 'string' || !imageData.startsWith('data:image/')) {
            console.error('无效的图片数据');
            resolve(imageData);
            return;
        }
        
        const img = new Image();
        img.onload = function() {
            console.log('图片加载成功，尺寸:', img.width, 'x', img.height);
            
            if (imageData.length < 500000) {
                console.log('图片大小合适，直接返回');
                resolve(imageData);
                return;
            }
            
            const maxWidth = 800;
            const maxHeight = 600;
            let width = img.width;
            let height = img.height;
            
            if (width > maxWidth) {
                height = Math.round((height * maxWidth) / width);
                width = maxWidth;
            }
            if (height > maxHeight) {
                width = Math.round((width * maxHeight) / height);
                height = maxHeight;
            }
            
            console.log('优化后图片尺寸:', width, 'x', height);
            
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'medium';
            
            ctx.drawImage(img, 0, 0, width, height);
            
            let quality = 0.7;
            if (width < 400 || height < 300) {
                quality = 0.8;
            } else if (width > 600 || height > 450) {
                quality = 0.6;
            }
            
            console.log('使用质量参数:', quality);
            
            const optimizedData = canvas.toDataURL('image/jpeg', quality);
            console.log('优化后图片数据长度:', optimizedData.length);
            
            img.src = '';
            
            resolve(optimizedData);
        };
        img.onerror = function() {
            console.error('图片加载失败');
            resolve(imageData);
        };
        img.src = imageData;
    });
}

export function generateMockData() {
    return {
        name: '示例食品',
        score: 5,
        scoreLabel: '一般',
        scoreClass: 'score-average',
        nutrition: {
            calories: 200,
            protein: 5,
            fat: 10,
            carbs: 25,
            fiber: 2
        },
        ingredients: ['小麦粉', '白砂糖', '植物油', '食用盐', '食品添加剂'],
        advice: '建议适量食用，控制每日摄入量',
        alternatives: [
            {
                name: '低卡替代产品1',
                calories: 100,
                description: '更健康的选择'
            },
            {
                name: '低卡替代产品2',
                calories: 150,
                description: '营养均衡的选择'
            }
        ],
        date: new Date().toLocaleString()
    };
}
