// 历史记录相关功能

// 保存到历史记录
function saveToHistory(data) {
    try {
        // 验证数据
        if (!data || typeof data !== 'object') {
            console.error('无效的历史记录数据');
            return;
        }
        
        // 从本地存储获取历史记录
        let history = [];
        try {
            const storedHistory = localStorage.getItem('foodHistory');
            if (storedHistory) {
                history = JSON.parse(storedHistory);
                if (!Array.isArray(history)) {
                    history = [];
                }
            }
        } catch (error) {
            console.error('解析历史记录失败:', error);
            history = [];
        }

        // 添加新记录
        history.unshift({
            id: Date.now(),
            name: data.name || '未命名食品',
            score: data.score || 0,
            scoreLabel: data.scoreLabel || '未知',
            scoreClass: data.scoreClass || 'score-average',
            nutrition: data.nutrition || { calories: 0, protein: 0, fat: 0, carbs: 0, fiber: 0 },
            ingredients: data.ingredients || [],
            advice: data.advice || '无建议',
            date: data.date || new Date().toLocaleString()
        });

        // 限制历史记录数量为20条
        if (history.length > 20) {
            history = history.slice(0, 20);
        }

        // 保存回本地存储
        localStorage.setItem('foodHistory', JSON.stringify(history));
    } catch (error) {
        console.error('保存历史记录失败:', error);
    }
}

// 加载历史记录
function loadHistory() {
    try {
        const historyList = document.getElementById('history-list');
        if (!historyList) {
            console.error('历史记录容器不存在');
            return;
        }
        
        let history = [];
        try {
            const storedHistory = localStorage.getItem('foodHistory');
            if (storedHistory) {
                history = JSON.parse(storedHistory);
                if (!Array.isArray(history)) {
                    history = [];
                }
            }
        } catch (error) {
            console.error('解析历史记录失败:', error);
            history = [];
        }

        if (history.length === 0) {
            historyList.innerHTML = '<div class="history-empty">暂无历史记录</div>';
            return;
        }

        historyList.innerHTML = '';

        history.forEach(item => {
            try {
                const historyItem = document.createElement('div');
                historyItem.className = 'history-item';
                historyItem.innerHTML = `
                    <h4>${item.name || '未命名食品'}</h4>
                    <div class="score">健康评分：<span style="color: ${getScoreColor(item.score || 0)}">${item.score || 0}分 (${item.scoreLabel || '未知'})</span></div>
                    <div class="nutrition">热量：${item.nutrition?.calories || 0} kcal | 蛋白质：${item.nutrition?.protein || 0} g</div>
                    <div class="advice">建议：${item.advice || '无建议'}</div>
                    <div class="date">${item.date || ''}</div>
                `;
                historyList.appendChild(historyItem);
            } catch (error) {
                console.error('创建历史记录项失败:', error);
            }
        });
    } catch (error) {
        console.error('加载历史记录失败:', error);
        const historyList = document.getElementById('history-list');
        if (historyList) {
            historyList.innerHTML = '<div class="history-empty">加载历史记录失败</div>';
        }
    }
}

// 根据分数获取颜色
function getScoreColor(score) {
    try {
        const scoreNum = parseFloat(score);
        if (scoreNum >= 8) return '#4CAF50';
        if (scoreNum >= 6) return '#8BC34A';
        if (scoreNum >= 4) return '#FFC107';
        return '#F44336';
    } catch (error) {
        return '#FFC107'; // 默认颜色
    }
}

// 清除历史记录
function clearHistory() {
    try {
        if (confirm('确定要清除所有历史记录吗？')) {
            localStorage.removeItem('foodHistory');
            loadHistory();
        }
    } catch (error) {
        console.error('清除历史记录失败:', error);
        alert('清除历史记录失败，请重试');
    }
}

// 绑定清除历史记录按钮事件（如果存在）
document.addEventListener('DOMContentLoaded', function() {
    const clearBtn = document.getElementById('clear-history');
    if (clearBtn) {
        clearBtn.addEventListener('click', clearHistory);
    }
});