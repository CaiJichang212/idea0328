// 历史记录模块
export function saveToHistory(data) {
    try {
        const history = getHistory();
        history.unshift(data);
        
        if (history.length > 50) {
            history.pop();
        }
        
        localStorage.setItem('foodHealthHistory', JSON.stringify(history));
        console.log('历史记录已保存');
    } catch (error) {
        console.error('保存历史记录失败:', error);
    }
}

export function getHistory() {
    try {
        const history = localStorage.getItem('foodHealthHistory');
        return history ? JSON.parse(history) : [];
    } catch (error) {
        console.error('获取历史记录失败:', error);
        return [];
    }
}

export function clearHistory() {
    try {
        localStorage.removeItem('foodHealthHistory');
        console.log('历史记录已清除');
    } catch (error) {
        console.error('清除历史记录失败:', error);
    }
}

export function renderHistory() {
    const historyList = document.getElementById('history-list');
    if (!historyList) {
        console.error('历史记录列表元素未找到');
        return;
    }
    
    const history = getHistory();
    
    if (history.length === 0) {
        historyList.innerHTML = '<div class="history-empty">暂无历史记录</div>';
        return;
    }
    
    historyList.innerHTML = history.map(item => `
        <div class="history-item">
            <div class="history-header">
                <h4>${item.name}</h4>
                <span class="history-date">${item.date}</span>
            </div>
            <div class="history-score ${item.scoreClass}">${item.score}分 (${item.scoreLabel})</div>
            <div class="history-nutrition">
                <div class="nutrition-item">热量: ${item.nutrition.calories} kcal</div>
                <div class="nutrition-item">蛋白质: ${item.nutrition.protein} g</div>
                <div class="nutrition-item">脂肪: ${item.nutrition.fat} g</div>
                <div class="nutrition-item">碳水: ${item.nutrition.carbs} g</div>
            </div>
        </div>
    `).join('');
}
