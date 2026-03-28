// 分析模块
export function displayAnalysisResult(data) {
    console.log('显示分析结果:', data);
    
    const scoreCircle = document.getElementById('score-circle');
    const scoreValue = document.getElementById('score-value');
    const scoreLabel = document.getElementById('score-label');
    const nutritionGrid = document.getElementById('nutrition-grid');
    const ingredientsList = document.getElementById('ingredients-list');
    const adviceContent = document.getElementById('advice-content');
    const alternativeList = document.getElementById('alternative-list');

    if (!scoreCircle || !scoreValue || !scoreLabel || !nutritionGrid || !ingredientsList || !adviceContent || !alternativeList) {
        console.error('结果显示相关元素未找到');
        return;
    }

    scoreCircle.className = `score-circle ${data.scoreClass}`;
    scoreValue.textContent = data.score;
    scoreLabel.textContent = data.scoreLabel;

    nutritionGrid.innerHTML = `
        <div class="nutrition-item">
            <span class="nutrition-label">热量</span>
            <span class="nutrition-value">${data.nutrition.calories} kcal</span>
        </div>
        <div class="nutrition-item">
            <span class="nutrition-label">蛋白质</span>
            <span class="nutrition-value">${data.nutrition.protein} g</span>
        </div>
        <div class="nutrition-item">
            <span class="nutrition-label">脂肪</span>
            <span class="nutrition-value">${data.nutrition.fat} g</span>
        </div>
        <div class="nutrition-item">
            <span class="nutrition-label">碳水化合物</span>
            <span class="nutrition-value">${data.nutrition.carbs} g</span>
        </div>
        <div class="nutrition-item">
            <span class="nutrition-label">纤维素</span>
            <span class="nutrition-value">${data.nutrition.fiber} g</span>
        </div>
    `;

    ingredientsList.innerHTML = data.ingredients.map(ingredient => 
        `<div class="ingredient-item">${ingredient}</div>`
    ).join('');

    adviceContent.textContent = data.advice;

    alternativeList.innerHTML = data.alternatives.map(alt => `
        <div class="alternative-item">
            <h4>${alt.name}</h4>
            <p class="alternative-calories">热量: ${alt.calories} kcal</p>
            <p class="alternative-description">${alt.description}</p>
        </div>
    `).join('');

    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.classList.remove('active');
        page.style.display = 'none';
    });
    const resultPage = document.getElementById('result');
    if (resultPage) {
        resultPage.style.display = 'block';
        resultPage.classList.add('active');
    }
    
    // 更新导航栏状态
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#result') {
            link.classList.add('active');
        }
    });
}

export function updateCalorieBudget(calories) {
    const caloriesConsumed = document.getElementById('calories-consumed');
    const caloriesRemaining = document.getElementById('calories-remaining');
    const dailyBudget = document.getElementById('daily-budget');

    if (!caloriesConsumed || !caloriesRemaining || !dailyBudget) {
        console.error('热量预算相关元素未找到');
        return;
    }

    const currentConsumed = parseInt(caloriesConsumed.textContent) || 0;
    const newConsumed = currentConsumed + calories;
    const budget = parseInt(dailyBudget.value) || 2000;
    const remaining = Math.max(0, budget - newConsumed);

    caloriesConsumed.textContent = newConsumed;
    caloriesRemaining.textContent = remaining;

    localStorage.setItem('caloriesConsumed', newConsumed.toString());
}

export function resetCalorieBudget() {
    const caloriesConsumed = document.getElementById('calories-consumed');
    const caloriesRemaining = document.getElementById('calories-remaining');
    const dailyBudget = document.getElementById('daily-budget');

    if (!caloriesConsumed || !caloriesRemaining || !dailyBudget) {
        console.error('热量预算相关元素未找到');
        return;
    }

    const budget = parseInt(dailyBudget.value) || 2000;
    caloriesConsumed.textContent = '0';
    caloriesRemaining.textContent = budget;
    localStorage.removeItem('caloriesConsumed');
}
