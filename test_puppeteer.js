const puppeteer = require('puppeteer');
const http = require('http');
const path = require('path');
const fs = require('fs');

const PORT = 3001;
const BASE_URL = `http://localhost:${PORT}`;

const TEST_IMAGE_PATH = path.join(__dirname, 'public', 'images', '测试1-辣条.jpg');

async function startTestServer() {
    return new Promise((resolve, reject) => {
        const server = http.createServer((req, res) => {
            let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
            const extname = path.extname(filePath);
            const contentTypes = {
                '.html': 'text/html',
                '.js': 'text/javascript',
                '.css': 'text/css',
                '.json': 'application/json',
                '.png': 'image/png',
                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg'
            };

            const contentType = contentTypes[extname] || 'application/octet-stream';

            fs.readFile(filePath, (err, content) => {
                if (err) {
                    res.writeHead(404);
                    res.end('File not found');
                } else {
                    res.writeHead(200, { 'Content-Type': contentType });
                    res.end(content);
                }
            });
        });

        server.listen(PORT, () => {
            console.log(`测试服务器运行在 ${BASE_URL}`);
            resolve(server);
        });

        server.on('error', reject);
    });
}

async function runTests() {
    let server;
    let browser;

    try {
        console.log('='.repeat(50));
        console.log('开始 Puppeteer 自动测试');
        console.log('='.repeat(50));

        server = await startTestServer();

        console.log('\n启动浏览器...');
        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();

        const testResults = {
            passed: 0,
            failed: 0,
            tests: []
        };

        function logTest(name, passed, error = null) {
            const status = passed ? '✅ PASS' : '❌ FAIL';
            console.log(`${status}: ${name}`);
            if (error) {
                console.log(`   错误: ${error}`);
            }
            testResults.tests.push({ name, passed, error });
            if (passed) {
                testResults.passed++;
            } else {
                testResults.failed++;
            }
        }

        console.log('\n--- 测试 1: 页面加载 ---');
        await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
        const title = await page.title();
        logTest('页面标题正确', title === '包装食物健康评估');

        console.log('\n--- 测试 2: 导航栏元素 ---');
        const navLinks = await page.$$('.nav-link');
        logTest('导航栏包含3个链接', navLinks.length === 3);

        const logoText = await page.$eval('.logo', el => el.textContent);
        logTest('Logo文本正确', logoText === '食物健康评估');

        console.log('\n--- 测试 3: 首页功能区域 ---');
        const goalButtons = await page.$$('.goal-btn');
        logTest('健康目标按钮存在', goalButtons.length === 3);

        const captureButtons = await page.$$('.capture-btn');
        logTest('识别方式按钮存在', captureButtons.length === 3);

        console.log('\n--- 测试 4: 热量预算管理 ---');
        const dailyBudgetInput = await page.$('#daily-budget');
        logTest('每日预算输入框存在', dailyBudgetInput !== null);

        const caloriesConsumed = await page.$('#calories-consumed');
        logTest('已消耗热量显示存在', caloriesConsumed !== null);

        const caloriesRemaining = await page.$('#calories-remaining');
        logTest('剩余预算显示存在', caloriesRemaining !== null);

        console.log('\n--- 测试 5: 页面导航 ---');
        await page.click('a[href="#history"]');
        await page.waitForSelector('#history.active', { timeout: 2000 });
        logTest('点击历史记录链接成功跳转', true);

        await page.click('a[href="#home"]');
        await page.waitForSelector('#home.active', { timeout: 2000 });
        logTest('返回首页导航成功', true);

        console.log('\n--- 测试 6: 环境变量配置加载 ---');
        const envConfig = await page.evaluate(() => {
            return typeof window.ENV_CONFIG !== 'undefined';
        });
        logTest('ENV_CONFIG 对象已加载', envConfig);

        const hasApiKey = await page.evaluate(() => {
            return window.ENV_CONFIG && window.ENV_CONFIG.MODELSCOPE_API_KEY &&
                   window.ENV_CONFIG.MODELSCOPE_API_KEY !== 'your_modelscope_api_key_here';
        });
        logTest('API密钥已配置', hasApiKey);

        console.log('\n--- 测试 7: 页面响应式布局 ---');
        await page.setViewport({ width: 375, height: 667 });
        await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
        const mobileNav = await page.$('nav');
        logTest('移动端视图下导航栏存在', mobileNav !== null);

        console.log('\n--- 测试 8: 上传功能UI ---');
        await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
        const uploadInput = await page.$('#image-upload');
        logTest('图片上传输入框存在', uploadInput !== null);

        const uploadBtn = await page.$('#upload-btn');
        logTest('上传按钮存在', uploadBtn !== null);

        console.log('\n--- 测试 9: 历史记录页面 ---');
        await page.goto(`${BASE_URL}#/history`, { waitUntil: 'networkidle0' });
        const clearHistoryBtn = await page.$('#clear-history');
        logTest('清除历史按钮存在', clearHistoryBtn !== null);

        const historyList = await page.$('#history-list');
        logTest('历史记录列表容器存在', historyList !== null);

        console.log('\n--- 测试 10: 结果页面 ---');
        await page.goto(`${BASE_URL}#/result`, { waitUntil: 'networkidle0' });
        const scoreCircle = await page.$('#score-circle');
        logTest('评分圆圈组件存在', scoreCircle !== null);

        const nutritionGrid = await page.$('#nutrition-grid');
        logTest('营养成分网格存在', nutritionGrid !== null);

        const ingredientsList = await page.$('#ingredients-list');
        logTest('配料表列表存在', ingredientsList !== null);

        console.log('\n' + '='.repeat(50));
        console.log('测试结果汇总');
        console.log('='.repeat(50));
        console.log(`通过: ${testResults.passed}`);
        console.log(`失败: ${testResults.failed}`);
        console.log(`总计: ${testResults.passed + testResults.failed}`);

        if (testResults.failed > 0) {
            console.log('\n失败测试:');
            testResults.tests
                .filter(t => !t.passed)
                .forEach(t => console.log(`  - ${t.name}: ${t.error}`));
        }

        console.log('\n' + '='.repeat(50));
        console.log('Puppeteer 自动测试完成');
        console.log('='.repeat(50));

        return testResults.failed === 0;

    } catch (error) {
        console.error('测试执行出错:', error);
        throw error;
    } finally {
        if (browser) {
            await browser.close();
        }
        if (server) {
            server.close();
        }
    }
}

runTests()
    .then(success => {
        process.exit(success ? 0 : 1);
    })
    .catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
