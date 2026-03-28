// 主模块
import { callQwenAPI, parseQwenResponse } from './api.js';
import { initCamera, initUpload } from './camera.js';
import { displayAnalysisResult, updateCalorieBudget, resetCalorieBudget } from './analysis.js';
import { saveToHistory, renderHistory, clearHistory } from './history.js';

let currentGoal = '减脂';

function showLoading() {
    document.getElementById('loading').classList.remove('hidden');
}

function hideLoading() {
    document.getElementById('loading').classList.add('hidden');
}

function switchPage(pageId) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.classList.remove('active');
        page.style.display = 'none';
    });
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.style.display = 'block';
        targetPage.classList.add('active');
    }
    
    if (pageId === 'history') {
        renderHistory();
    }
}

async function processImage(imageData) {
    showLoading();
    try {
        const response = await callQwenAPI(imageData);
        const result = parseQwenResponse(response);
        displayAnalysisResult(result);
        saveToHistory(result);
        updateCalorieBudget(result.nutrition.calories);
    } catch (error) {
        console.error('处理图片失败:', error);
        alert('识别失败，请重试');
    } finally {
        hideLoading();
    }
}

function initEventListeners() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const pageId = link.getAttribute('href').substring(1);
            switchPage(pageId);
            
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });

    const goalBtns = document.querySelectorAll('.goal-btn');
    goalBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            goalBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentGoal = btn.dataset.goal;
        });
    });

    const resetBudgetBtn = document.getElementById('reset-budget');
    if (resetBudgetBtn) {
        resetBudgetBtn.addEventListener('click', resetCalorieBudget);
    }

    const backToHome = document.getElementById('back-to-home');
    if (backToHome) {
        backToHome.addEventListener('click', () => switchPage('home'));
    }

    const backToHomeFromHistory = document.getElementById('back-to-home-from-history');
    if (backToHomeFromHistory) {
        backToHomeFromHistory.addEventListener('click', () => switchPage('home'));
    }

    const clearHistoryBtn = document.getElementById('clear-history');
    if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener('click', () => {
            if (confirm('确定要清除所有历史记录吗？')) {
                clearHistory();
                renderHistory();
            }
        });
    }

    const dailyBudget = document.getElementById('daily-budget');
    if (dailyBudget) {
        dailyBudget.addEventListener('change', () => {
            const budget = parseInt(dailyBudget.value) || 2000;
            const caloriesConsumed = document.getElementById('calories-consumed');
            const caloriesRemaining = document.getElementById('calories-remaining');
            if (caloriesConsumed && caloriesRemaining) {
                const consumed = parseInt(caloriesConsumed.textContent) || 0;
                caloriesRemaining.textContent = Math.max(0, budget - consumed);
            }
        });
    }
}

function loadSavedState() {
    const savedConsumed = localStorage.getItem('caloriesConsumed');
    if (savedConsumed) {
        const caloriesConsumed = document.getElementById('calories-consumed');
        const caloriesRemaining = document.getElementById('calories-remaining');
        const dailyBudget = document.getElementById('daily-budget');
        if (caloriesConsumed && caloriesRemaining && dailyBudget) {
            const consumed = parseInt(savedConsumed) || 0;
            const budget = parseInt(dailyBudget.value) || 2000;
            caloriesConsumed.textContent = consumed;
            caloriesRemaining.textContent = Math.max(0, budget - consumed);
        }
    }
}

function initApp() {
    console.log('初始化应用...');
    
    initCamera();
    initUpload();
    initEventListeners();
    loadSavedState();
    
    window.processImage = processImage;
    
    console.log('应用初始化完成');
}

document.addEventListener('DOMContentLoaded', initApp);
