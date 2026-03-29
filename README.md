# 包装食物健康评估工具

一个基于AI的包装食物健康评估和减脂建议工具，通过拍照识别包装食物的配料表，分析其健康程度，给出健康评分指数，为减脂人群提供个性化的营养建议和健康指导。

## 核心功能

- **包装食物识别**：支持拍照上传和本地图片选择，使用AI图像识别技术识别包装信息和配料表内容
- **健康评估**：根据配料表成分分析，计算并给出0-10分的健康评分指数，使用颜色编码快速传达健康程度
- **营养分析**：提供详细的营养成分分析，包括热量、蛋白质、脂肪、碳水化合物、纤维素等
- **减脂人群专属功能**：热量预算管理、低卡替代推荐、餐前决策助手
- **历史记录**：保存用户的包装食物识别历史（使用浏览器本地存储）

## 技术实现

- **前端**：HTML5、CSS3、JavaScript
- **AI识别**：集成Qwen3.5-122B-A10B模型进行图像识别和分析
- **数据存储**：使用浏览器本地存储（localStorage）存储用户数据和识别结果

## 快速开始

项目提供测试模式，当API调用失败时会自动使用模拟数据，方便快速体验核心功能。

## 部署方式

### Vercel部署（推荐）

项目已优化支持Vercel部署，可通过以下步骤部署：

1. Fork本项目到您的GitHub账户
2. 访问 [Vercel](https://vercel.com) 并登录
3. 点击 "New Project" 导入您的GitHub仓库
4. 配置环境变量：
   - 在Vercel项目设置中，添加环境变量 `MODELSCOPE_API_KEY`
   - 值为您的ModelScope API密钥
5. 点击部署即可

**在线演示**：[https://food-health-assessment.vercel.app](https://food-health-assessment.vercel.app)

### 环境变量配置

#### Vercel部署环境变量

在Vercel部署时需要在项目设置中配置以下环境变量：

| 变量名 | 说明 | 获取方式 |
|--------|------|----------|
| `MODELSCOPE_API_KEY` | ModelScope API密钥 | 访问 [ModelScope](https://modelscope.cn) 注册获取 |

#### 本地开发环境变量

1. 复制 `env-config.js.example` 为 `env-config.js`
2. 编辑 `env-config.js`，填入您的 ModelScope API密钥：
```javascript
window.ENV_CONFIG = {
    MODELSCOPE_API_KEY: '您的API密钥',
    API_BASE_URL: 'https://api-inference.modelscope.cn/v1/chat/completions',
    MODEL_NAME: 'Qwen/Qwen3.5-122B-A10B',
    CACHE_EXPIRY_MS: 86400000
};
```

**重要**：`env-config.js` 文件包含敏感信息，已被 `.gitignore` 排除，不会被提交到版本控制系统。

### 本地开发

1. 克隆项目到本地
2. 复制 `env-config.js.example` 为 `env-config.js`
3. 编辑 `env-config.js`，填入您的 ModelScope API密钥
4. 安装依赖：`npm install`
5. 启动本地服务器：`npm start`
6. 浏览器访问：`http://localhost:3000`

**注意**：本地开发时，需要在 `env-config.js` 中配置 API 密钥，否则无法调用 ModelScope API。

## 使用说明

1. 访问网页应用
2. 选择健康目标（默认减脂）
3. 设置每日热量预算
4. 选择识别方式：拍照、上传图片或扫描条码（条码扫描功能暂未实现）
5. 系统会自动分析图片，识别配料表和营养成分
6. 查看健康评分、详细分析结果和减脂建议
7. 如食品不健康，查看低卡替代产品推荐
8. 查看历史记录，了解过往识别结果

## 数据安全与隐私保护

- 用户授权：获取用户摄像头权限前明确告知并获得授权
- 本地存储：用户数据仅存储在本地浏览器，不上传服务器

## 浏览器兼容性

支持主流浏览器，包括Chrome、Firefox、Safari和Edge。

## 注意事项

- 图片识别需要良好的网络连接
- 为获得最佳识别效果，请确保包装食物图片清晰，配料表可见
- 系统会在API调用失败时使用模拟数据，确保用户体验

## 项目结构

```
├── api/
│   └── analyze.js         # Vercel Serverless API代理
├── src/
│   ├── js/
│   │   ├── api.js         # API调用功能
│   │   ├── analysis.js    # 分析功能
│   │   ├── camera.js      # 摄像头功能
│   │   ├── history.js     # 历史记录功能
│   │   ├── main.js        # 主功能
│   │   └── utils.js       # 工具函数
│   └── css/
│       └── style.css      # 样式文件
├── public/
│   └── images/            # 图片资源
├── index.html             # 主页面
├── env-config.js          # 本地环境配置文件（不提交到git）
├── env-config.js.example   # 环境配置示例文件
├── package.json           # 项目配置
├── vercel.json            # Vercel配置文件
├── .env.example           # 环境变量示例
├── .gitignore             # Git忽略配置
└── README.md              # 项目说明
```