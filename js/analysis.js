// 数据分析相关功能

// 分析营养成分
function analyzeNutrition(nutritionData) {
    // 这里可以添加更复杂的营养成分分析逻辑
    // 例如计算热量密度、营养均衡度等
    return {
        isBalanced: nutritionData.protein > 5 && nutritionData.fiber > 2,
        isHighCalorie: nutritionData.calories > 300,
        isHighFat: nutritionData.fat > 15,
        isHighCarbs: nutritionData.carbs > 40
    };
}

// 分析配料表
function analyzeIngredients(ingredients) {
    // 这里可以添加更复杂的配料表分析逻辑
    // 例如识别添加剂、防腐剂等
    const unhealthyIngredients = [
        '白砂糖', '蔗糖', '果糖', '葡萄糖浆',
        '氢化植物油', '反式脂肪酸',
        '防腐剂', '人工色素', '人工香精'
    ];

    const foundUnhealthy = ingredients.filter(ingredient => {
        return unhealthyIngredients.some(unhealthy => 
            ingredient.includes(unhealthy)
        );
    });

    return {
        hasUnhealthyIngredients: foundUnhealthy.length > 0,
        unhealthyIngredients: foundUnhealthy,
        ingredientCount: ingredients.length
    };
}

// 计算健康评分
function calculateHealthScore(nutritionData, ingredients) {
    let score = 10;

    // 根据营养成分扣分
    if (nutritionData.calories > 400) score -= 2;
    else if (nutritionData.calories > 300) score -= 1;

    if (nutritionData.fat > 20) score -= 2;
    else if (nutritionData.fat > 10) score -= 1;

    if (nutritionData.carbs > 50) score -= 2;
    else if (nutritionData.carbs > 30) score -= 1;

    if (nutritionData.fiber < 2) score -= 1;
    else if (nutritionData.fiber > 5) score += 1; // 高纤维加分

    if (nutritionData.protein > 15) score += 1; // 高蛋白加分

    // 根据配料表扣分
    const ingredientAnalysis = analyzeIngredients(ingredients);
    if (ingredientAnalysis.hasUnhealthyIngredients) {
        // 根据不健康成分的数量和严重程度扣分
        const unhealthyCount = ingredientAnalysis.unhealthyIngredients.length;
        if (unhealthyCount >= 3) score -= 3;
        else if (unhealthyCount >= 2) score -= 2;
        else score -= 1;
    }

    // 配料表长度分析
    if (ingredients.length > 20) score -= 1; // 配料表过长扣分

    // 确保分数在0-10之间
    return Math.max(0, Math.min(10, score));
}

// 获取减脂建议
function getDietaryAdvice(score, nutritionData) {
    if (score >= 8) {
        return '建议食用：该食品营养均衡，适合减脂期间食用。';
    } else if (score >= 6) {
        return '适量食用：该食品营养尚可，但需注意控制摄入量。';
    } else if (score >= 4) {
        return '少量食用：该食品营养价值一般，建议减少食用频率。';
    } else {
        return '避免食用：该食品营养价值较低，不建议在减脂期间食用。';
    }
}

// 获取低卡替代推荐
function getAlternativeRecommendations(nutritionData) {
    // 这里可以根据实际情况添加更智能的推荐逻辑
    const alternatives = [
        {
            name: '低脂酸奶',
            calories: 100,
            description: '富含蛋白质和钙，有助于增加饱腹感。'
        },
        {
            name: '水果沙拉',
            calories: 150,
            description: '富含维生素和纤维素，低热量且营养丰富。'
        },
        {
            name: '烤鸡胸肉',
            calories: 120,
            description: '高蛋白、低脂肪，适合减脂期间补充蛋白质。'
        }
    ];

    // 根据原食品的热量和营养成分筛选推荐
    return alternatives.filter(alt => 
        alt.calories < nutritionData.calories * 0.7
    );
}