// 页面导航功能
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const pages = document.querySelectorAll('.page');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);

            // 更新导航链接状态
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');

            // 更新页面状态
            pages.forEach(page => {
                page.classList.remove('active');
                page.classList.add('hidden');
                if (page.id === targetId) {
                    page.classList.remove('hidden');
                    page.classList.add('active');
                }
            });

            // 如果切换到历史记录页，加载历史记录
            if (targetId === 'history') {
                loadHistory();
            }
        });
    });
}

// 健康目标选择功能
function initGoalSelector() {
    const goalBtns = document.querySelectorAll('.goal-btn');

    goalBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            goalBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            // 保存选中的健康目标到本地存储
            localStorage.setItem('healthGoal', this.getAttribute('data-goal'));
        });
    });

    // 从本地存储加载健康目标
    const savedGoal = localStorage.getItem('healthGoal');
    if (savedGoal) {
        goalBtns.forEach(btn => {
            if (btn.getAttribute('data-goal') === savedGoal) {
                btn.classList.add('active');
            }
        });
    }
}

// 热量预算管理功能
function initCalorieBudget() {
    const dailyBudgetInput = document.getElementById('daily-budget');
    const caloriesConsumedEl = document.getElementById('calories-consumed');
    const caloriesRemainingEl = document.getElementById('calories-remaining');
    const resetBudgetBtn = document.getElementById('reset-budget');

    // 从本地存储加载预算数据
    const today = new Date().toDateString();
    const savedDate = localStorage.getItem('budgetDate');
    const savedBudget = localStorage.getItem('dailyBudget') || 2000;
    const savedConsumed = savedDate === today ? localStorage.getItem('caloriesConsumed') || 0 : 0;

    // 更新UI
    dailyBudgetInput.value = savedBudget;
    caloriesConsumedEl.textContent = savedConsumed;
    const remaining = savedBudget - savedConsumed;
    caloriesRemainingEl.textContent = Math.max(0, remaining);

    // 保存每日预算
    dailyBudgetInput.addEventListener('change', function() {
        const budget = parseInt(this.value) || 2000;
        localStorage.setItem('dailyBudget', budget);
        updateBudgetDisplay();
    });

    // 重置预算
    resetBudgetBtn.addEventListener('click', function() {
        localStorage.setItem('caloriesConsumed', 0);
        localStorage.setItem('budgetDate', today);
        updateBudgetDisplay();
    });

    // 更新预算显示
    function updateBudgetDisplay() {
        const budget = parseInt(localStorage.getItem('dailyBudget') || 2000);
        const consumed = parseInt(localStorage.getItem('caloriesConsumed') || 0);
        const remaining = budget - consumed;
        
        caloriesConsumedEl.textContent = consumed;
        caloriesRemainingEl.textContent = Math.max(0, remaining);
    }

    // 暴露更新预算的方法
    window.updateCalorieBudget = function(calories) {
        const today = new Date().toDateString();
        const savedDate = localStorage.getItem('budgetDate');
        
        if (savedDate !== today) {
            localStorage.setItem('caloriesConsumed', 0);
            localStorage.setItem('budgetDate', today);
        }
        
        const currentConsumed = parseInt(localStorage.getItem('caloriesConsumed') || 0);
        const newConsumed = currentConsumed + calories;
        localStorage.setItem('caloriesConsumed', newConsumed);
        updateBudgetDisplay();
    };
}

// 识别方式选择功能
function initCaptureOptions() {
    // 拍照按钮
    document.getElementById('camera-btn').addEventListener('click', function() {
        document.getElementById('camera-preview').classList.remove('hidden');
        document.getElementById('upload-preview').classList.add('hidden');
        startCamera();
    });

    // 上传按钮
    document.getElementById('upload-btn').addEventListener('click', function() {
        document.getElementById('upload-preview').classList.remove('hidden');
        document.getElementById('camera-preview').classList.add('hidden');
    });

    // 条码扫描按钮
    document.getElementById('barcode-btn').addEventListener('click', function() {
        alert('条码扫描功能暂未实现，敬请期待！');
    });

    // 取消摄像头
    document.getElementById('cancel-camera').addEventListener('click', function() {
        document.getElementById('camera-preview').classList.add('hidden');
        stopCamera();
    });

    // 取消上传
    document.getElementById('cancel-upload').addEventListener('click', function() {
        document.getElementById('upload-preview').classList.add('hidden');
        // 清空文件选择和预览
        document.getElementById('image-upload').value = '';
        document.getElementById('image-preview').innerHTML = '';
    });

    // 处理上传图片
    document.getElementById('process-upload').addEventListener('click', function() {
        const fileInput = document.getElementById('image-upload');
        if (fileInput.files && fileInput.files[0]) {
            const file = fileInput.files[0];
            
            // 检查文件类型
            if (!file.type.match('image.*')) {
                alert('请选择图片文件');
                return;
            }
            
            // 检查文件大小（限制为5MB）
            if (file.size > 5 * 1024 * 1024) {
                alert('图片大小不能超过5MB');
                return;
            }
            
            const reader = new FileReader();

            reader.onload = function(e) {
                const imageData = e.target.result;
                processImage(imageData);
            };

            reader.onerror = function(error) {
                console.error('Error reading file:', error);
                alert('文件读取失败，请重试');
            };

            reader.readAsDataURL(file);
        } else {
            alert('请选择一张图片');
        }
    });
    
    // 文件选择时自动预览
    document.getElementById('image-upload').addEventListener('change', function(e) {
        const file = e.target.files[0];
        const imagePreview = document.getElementById('image-preview');
        
        if (file) {
            // 检查文件类型
            if (!file.type.match('image.*')) {
                showError('请选择图片文件');
                this.value = ''; // 清空文件选择
                imagePreview.innerHTML = ''; // 清空预览
                return;
            }
            
            // 检查文件大小
            if (file.size > 5 * 1024 * 1024) {
                showError('图片大小不能超过5MB');
                this.value = ''; // 清空文件选择
                imagePreview.innerHTML = ''; // 清空预览
                return;
            }
            
            // 显示图片预览
            const reader = new FileReader();
            reader.onload = function(e) {
                imagePreview.innerHTML = `<img src="${e.target.result}" alt="预览图片">`;
            };
            reader.readAsDataURL(file);
        } else {
            // 清空预览
            imagePreview.innerHTML = '';
        }
    });

    // 返回首页按钮
    document.getElementById('back-to-home').addEventListener('click', function() {
        document.querySelectorAll('.nav-link')[0].click();
    });

    document.getElementById('back-to-home-from-history').addEventListener('click', function() {
        document.querySelectorAll('.nav-link')[0].click();
    });
}

// 显示错误提示
function showError(message) {
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    
    document.body.appendChild(errorElement);
    
    // 3秒后自动消失
    setTimeout(() => {
        errorElement.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            errorElement.remove();
        }, 300);
    }, 3000);
}

// 处理图片识别
async function processImage(imageData) {
    // 显示加载动画
    const loadingElement = document.getElementById('loading');
    loadingElement.classList.remove('hidden');

    try {
        // 验证图片数据
        if (!imageData || typeof imageData !== 'string') {
            throw new Error('无效的图片数据');
        }
        
        // 调用Qwen API
        const response = await callQwenAPI(imageData);
        
        // 验证API响应
        if (!response) {
            throw new Error('API返回空响应');
        }
        
        // 解析响应
        const analysisData = parseQwenResponse(response);

        // 验证分析数据
        if (!analysisData) {
            throw new Error('无法解析分析数据');
        }

        // 显示结果页
        document.querySelectorAll('.nav-link')[1].click();

        // 显示分析结果
        displayAnalysisResult(analysisData);

        // 保存到历史记录
        const historyData = {
            name: analysisData.name || '未命名食品',
            score: analysisData.score,
            scoreLabel: analysisData.scoreLabel,
            scoreClass: analysisData.scoreClass,
            nutrition: analysisData.nutrition,
            ingredients: analysisData.ingredients,
            advice: analysisData.advice || '无建议',
            date: new Date().toLocaleString()
        };
        saveToHistory(historyData);
        
        // 显示成功提示
        showSuccess('识别成功！');
    } catch (error) {
        console.error('处理图片失败:', error);
        
        // 根据错误类型显示不同的错误信息
        if (error.message.includes('API调用失败')) {
            showError('网络连接失败，请检查网络后重试');
        } else if (error.message.includes('无效的图片数据')) {
            showError('图片数据无效，请重新拍摄或上传');
        } else {
            showError('识别失败，正在使用模拟数据');
        }
        
        // 生成模拟数据作为备用
        const mockData = generateMockData();
        
        // 显示结果页
        document.querySelectorAll('.nav-link')[1].click();

        // 显示分析结果
        displayAnalysisResult(mockData);

        // 保存到历史记录
        const mockHistoryData = {
            name: mockData.name || '未命名食品',
            score: mockData.score,
            scoreLabel: mockData.scoreLabel,
            scoreClass: mockData.scoreClass,
            nutrition: mockData.nutrition,
            ingredients: mockData.ingredients,
            advice: mockData.advice || '无建议',
            date: new Date().toLocaleString()
        };
        saveToHistory(mockHistoryData);
    } finally {
        // 隐藏加载动画
        if (loadingElement) {
            loadingElement.classList.add('hidden');
        }

        // 隐藏摄像头预览
        const cameraPreview = document.getElementById('camera-preview');
        if (cameraPreview) {
            cameraPreview.classList.add('hidden');
        }
        
        const uploadPreview = document.getElementById('upload-preview');
        if (uploadPreview) {
            uploadPreview.classList.add('hidden');
        }
        
        // 确保摄像头停止
        if (typeof stopCamera === 'function') {
            stopCamera();
        }
    }
}

// 显示成功提示
function showSuccess(message) {
    const successElement = document.createElement('div');
    successElement.className = 'success-message';
    successElement.textContent = message;
    
    document.body.appendChild(successElement);
    
    // 3秒后自动消失
    setTimeout(() => {
        successElement.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            successElement.remove();
        }, 300);
    }, 3000);
}

// 生成模拟数据
function generateMockData() {
    const score = Math.floor(Math.random() * 11);
    let scoreLabel, scoreClass;

    if (score >= 8) {
        scoreLabel = '优秀';
        scoreClass = 'score-excellent';
    } else if (score >= 6) {
        scoreLabel = '良好';
        scoreClass = 'score-good';
    } else if (score >= 4) {
        scoreLabel = '一般';
        scoreClass = 'score-average';
    } else {
        scoreLabel = '较差';
        scoreClass = 'score-poor';
    }

    return {
        name: '示例食品',
        score: score,
        scoreLabel: scoreLabel,
        scoreClass: scoreClass,
        nutrition: {
            calories: Math.floor(Math.random() * 500) + 50,
            protein: (Math.random() * 30).toFixed(1),
            fat: (Math.random() * 20).toFixed(1),
            carbs: (Math.random() * 60).toFixed(1),
            fiber: (Math.random() * 10).toFixed(1)
        },
        ingredients: [
            '小麦粉',
            '白砂糖',
            '植物油',
            '鸡蛋',
            '食用盐',
            '食品添加剂'
        ],
        advice: score >= 6 ? '建议食用' : score >= 4 ? '适量食用' : '避免食用',
        alternatives: [
            {
                name: '低卡替代食品1',
                calories: Math.floor(Math.random() * 100) + 50,
                description: '低热量、低脂肪，适合减脂期间食用'
            },
            {
                name: '低卡替代食品2',
                calories: Math.floor(Math.random() * 100) + 50,
                description: '富含蛋白质和纤维素，饱腹感强'
            }
        ],
        date: new Date().toLocaleString()
    };
}

// 显示分析结果
function displayAnalysisResult(data) {
    // 首先切换到结果页
    const navLinks = document.querySelectorAll('.nav-link');
    const pages = document.querySelectorAll('.page');
    
    // 更新导航链接状态
    navLinks.forEach(l => l.classList.remove('active'));
    navLinks[1].classList.add('active');
    
    // 更新页面状态 - 显示结果页，隐藏其他页
    pages.forEach(page => {
        page.classList.remove('active');
        page.classList.add('hidden');
    });
    
    const resultPage = document.getElementById('result');
    if (resultPage) {
        resultPage.classList.remove('hidden');
        resultPage.classList.add('active');
    }
    
    // 延迟更新DOM，确保页面已完全切换
    setTimeout(() => {
        try {
            // 更新健康评分
            const scoreCircle = document.getElementById('score-circle');
            const scoreValue = document.getElementById('score-value');
            const scoreLabel = document.getElementById('score-label');

            if (scoreCircle && scoreValue && scoreLabel) {
                // 一次性更新健康评分
                scoreCircle.className = 'score-circle ' + data.scoreClass;
                scoreValue.textContent = data.score;
                scoreLabel.textContent = data.scoreLabel;
            }

            // 更新营养成分
            const nutritionGrid = document.getElementById('nutrition-grid');
            
            if (nutritionGrid) {
                // 清空营养成分网格
                while (nutritionGrid.firstChild) {
                    nutritionGrid.removeChild(nutritionGrid.firstChild);
                }

                // 确保营养数据存在且格式正确
                const nutrition = data.nutrition || {};
                const nutritionItems = [
                    { label: '热量', value: (nutrition.calories || 0) + ' kcal' },
                    { label: '蛋白质', value: (nutrition.protein || 0) + ' g' },
                    { label: '脂肪', value: (nutrition.fat || 0) + ' g' },
                    { label: '碳水化合物', value: (nutrition.carbs || 0) + ' g' },
                    { label: '纤维素', value: (nutrition.fiber || 0) + ' g' }
                ];

                // 创建营养成分项
                nutritionItems.forEach(item => {
                    const div = document.createElement('div');
                    div.className = 'nutrition-item';
                    
                    const valueDiv = document.createElement('div');
                    valueDiv.className = 'value';
                    valueDiv.textContent = item.value;
                    
                    const labelDiv = document.createElement('div');
                    labelDiv.className = 'label';
                    labelDiv.textContent = item.label;
                    
                    div.appendChild(valueDiv);
                    div.appendChild(labelDiv);
                    nutritionGrid.appendChild(div);
                });
            }

            // 更新配料表
            const ingredientsList = document.getElementById('ingredients-list');
            
            if (ingredientsList) {
                // 清空配料表
                while (ingredientsList.firstChild) {
                    ingredientsList.removeChild(ingredientsList.firstChild);
                }

                const ingredients = data.ingredients || [];
                
                // 创建配料项
                ingredients.forEach(ingredient => {
                    const div = document.createElement('div');
                    div.className = 'ingredient-item';
                    div.textContent = ingredient;
                    ingredientsList.appendChild(div);
                });
            }

            // 计算餐前决策建议
            const nutrition = data.nutrition || {};
            const calories = parseInt(nutrition.calories || 0);
            const protein = parseFloat(nutrition.protein || 0);
            const fat = parseFloat(nutrition.fat || 0);
            const carbs = parseFloat(nutrition.carbs || 0);
            const fiber = parseFloat(nutrition.fiber || 0);
            
            // 基于营养成分计算决策建议
            let decisionAdvice = '';
            if (data.score >= 8 && calories < 300 && fat < 10) {
                decisionAdvice = '建议食用';
            } else if (data.score >= 6 && calories < 400 && fat < 15) {
                decisionAdvice = '适量食用';
            } else {
                decisionAdvice = '避免食用';
            }

            // 更新减脂建议
            const adviceContent = document.getElementById('advice-content');
            if (adviceContent) {
                adviceContent.innerHTML = `
                    <p>根据分析结果，该食品的健康评分为 ${data.score} 分，属于 ${data.scoreLabel} 等级。</p>
                    <p>餐前决策：<strong>${decisionAdvice}</strong></p>
                    <p>减脂期间应注意控制摄入量，合理搭配其他营养食物。</p>
                `;
            }

            // 更新低卡替代推荐
            const alternativeList = document.getElementById('alternative-list');
            
            if (alternativeList) {
                // 清空替代推荐
                while (alternativeList.firstChild) {
                    alternativeList.removeChild(alternativeList.firstChild);
                }

                const alternatives = data.alternatives || generateLowCalorieAlternatives(calories, data.name || '该食品');
                
                if (alternatives.length > 0) {
                    alternatives.forEach(alternative => {
                        const div = document.createElement('div');
                        div.className = 'alternative-item';
                        
                        const nameH4 = document.createElement('h4');
                        nameH4.textContent = alternative.name || '未知食品';
                        
                        const caloriesDiv = document.createElement('div');
                        caloriesDiv.className = 'calories';
                        caloriesDiv.textContent = (alternative.calories || 0) + ' kcal';
                        
                        const descriptionDiv = document.createElement('div');
                        descriptionDiv.className = 'description';
                        descriptionDiv.textContent = alternative.description || '无描述';
                        
                        div.appendChild(nameH4);
                        div.appendChild(caloriesDiv);
                        div.appendChild(descriptionDiv);
                        alternativeList.appendChild(div);
                    });
                } else {
                    const noAlternativesP = document.createElement('p');
                    noAlternativesP.className = 'no-alternatives';
                    noAlternativesP.textContent = '暂无低卡替代推荐';
                    alternativeList.appendChild(noAlternativesP);
                }
            }

            // 更新热量预算
            if (calories > 0) {
                if (window.updateCalorieBudget) {
                    window.updateCalorieBudget(calories);
                }
            }
        } catch (error) {
            console.error('更新分析结果失败:', error);
            showError('显示结果失败，请重试');
        }
    }, 300); // 300ms延迟，确保页面切换完成
}

// 生成低卡替代推荐
function generateLowCalorieAlternatives(originalCalories, foodName) {
    const alternatives = [];
    
    // 根据原始热量生成低卡替代
    if (originalCalories > 150) {
        alternatives.push({
            name: '水果沙拉',
            calories: Math.floor(originalCalories * 0.4),
            description: '富含维生素和纤维素，低热量，适合减脂期间食用'
        });
        
        alternatives.push({
            name: '希腊酸奶',
            calories: Math.floor(originalCalories * 0.5),
            description: '富含蛋白质，饱腹感强，有助于控制食欲'
        });
        
        alternatives.push({
            name: '蔬菜三明治',
            calories: Math.floor(originalCalories * 0.6),
            description: '低热量，高纤维，营养均衡'
        });
    }
    
    return alternatives;
}

// 初始化所有功能
function initApp() {
    initNavigation();
    initGoalSelector();
    initCalorieBudget();
    initCaptureOptions();
}

// 页面加载完成后初始化
window.addEventListener('DOMContentLoaded', initApp);