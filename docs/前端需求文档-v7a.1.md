# 营养健康管家 Web应用 - 前端需求文档 v7a.1

## 文档说明

本文档专为前端设计和开发团队编写，基于需求文档v6.1提炼前端开发所需的页面规格、组件设计、API接口、状态管理等技术细节。

**目标读者**：前端开发工程师、UI设计师、测试工程师

**技术栈**：React 18 + TypeScript + Tailwind CSS + Zustand/Pinia + React Router/Vue Router + ECharts + Axios

---

## 1. 页面清单

### 1.1 页面路由表

| 路由路径 | 页面名称 | 优先级 | 设备适配 | 认证要求 |
|---------|---------|-------|---------|---------|
| `/` | 首页-今日概览 | P0 | 全设备 | 需登录 |
| `/login` | 登录页 | P0 | 全设备 | 无需登录 |
| `/register` | 注册页 | P0 | 全设备 | 无需登录 |
| `/identify` | 食物识别入口 | P0 | 全设备 | 需登录 |
| `/identify/result/:id` | 识别结果页 | P0 | 全设备 | 需登录 |
| `/records` | 饮食记录 | P0 | 全设备 | 需登录 |
| `/records/:date` | 指定日期记录 | P1 | 全设备 | 需登录 |
| `/profile` | 个人中心 | P0 | 全设备 | 需登录 |
| `/profile/edit` | 编辑个人信息 | P0 | 全设备 | 需登录 |
| `/profile/goal` | 健康目标设置 | P0 | 全设备 | 需登录 |
| `/nutrition` | 营养详情 | P1 | 全设备 | 需登录 |
| `/nutrition/:date` | 指定日期营养详情 | P1 | 全设备 | 需登录 |
| `/ai-assistant` | AI营养师 | P1 | 全设备 | 需登录 |
| `/report` | 数据报告 | P2 | 全设备 | 需登录 |
| `/favorites` | 收藏夹 | P2 | 全设备 | 需登录 |
| `/settings` | 设置 | P1 | 全设备 | 需登录 |

### 1.2 页面层级结构

```
App
├── AuthLayout（未登录布局）
│   ├── LoginPage
│   └── RegisterPage
│       └── GoalSetupStep（目标设置步骤）
│
└── MainLayout（已登录布局）
    ├── Sidebar（电脑端侧边栏）
    ├── BottomNav（移动端底部导航）
    ├── Header（电脑端顶部栏）
    │
    ├── HomePage（首页）
    │   └── TodayOverview（今日概览）
    │
    ├── IdentifyPage（识别入口）
    │   ├── ScanTab（扫码）
    │   ├── PhotoTab（拍照）
    │   ├── SearchTab（搜索）
    │   └── QuickAddTab（快捷添加）
    │
    ├── IdentifyResultPage（识别结果）
    │   ├── FoodInfoCard
    │   ├── NutritionDetailCard
    │   ├── SuggestionCard
    │   └── AlternativeCard
    │
    ├── RecordsPage（饮食记录）
    │   ├── TodayRecords
    │   └── HistoryRecords
    │
    ├── ProfilePage（个人中心）
    │   ├── ProfileEdit
    │   └── GoalSetting
    │
    ├── NutritionPage（营养详情）
    │   └── NutritionDetail
    │
    ├── AIAssistantPage（AI营养师）
    │   └── ChatInterface
    │
    ├── ReportPage（数据报告）
    │   ├── DailyReport
    │   └── WeeklyReport
    │
    └── SettingsPage（设置）
```

---

## 2. 页面详细规格

### 2.1 登录页 `/login`

#### 2.1.1 页面元素

| 元素 | 类型 | 必填 | 说明 |
|-----|-----|-----|-----|
| Logo | Image | 是 | 应用Logo |
| 标题 | Text | 是 | "营养健康管家" |
| 登录方式Tab | Tab | 是 | 手机号/邮箱切换 |
| 手机号输入框 | Input | 条件 | 手机号登录时显示，格式校验 |
| 验证码输入框 | Input | 条件 | 手机号登录时显示，6位数字 |
| 获取验证码按钮 | Button | 条件 | 60秒倒计时 |
| 邮箱输入框 | Input | 条件 | 邮箱登录时显示 |
| 密码输入框 | Input | 条件 | 邮箱登录时显示，密码可见切换 |
| 登录按钮 | Button | 是 | 主按钮，loading状态 |
| 注册链接 | Link | 是 | 跳转注册页 |

#### 2.1.2 表单校验规则

| 字段 | 校验规则 |
|-----|---------|
| 手机号 | 中国大陆手机号格式，11位数字 |
| 验证码 | 6位数字 |
| 邮箱 | 标准邮箱格式 |
| 密码 | 8-20位，至少包含字母和数字 |

#### 2.1.3 状态管理

```typescript
interface LoginState {
  loginType: 'phone' | 'email';
  phone: string;
  email: string;
  password: string;
  verifyCode: string;
  countdown: number;
  isLoading: boolean;
  errors: Record<string, string>;
}
```

#### 2.1.4 API调用

| 操作 | API | 说明 |
|-----|-----|-----|
| 获取验证码 | `POST /api/auth/sms` | 发送短信验证码 |
| 手机号登录 | `POST /api/auth/login/phone` | 返回token |
| 邮箱登录 | `POST /api/auth/login/email` | 返回token |

---

### 2.2 注册页 `/register`

#### 2.2.1 注册流程步骤

| 步骤 | 内容 | 说明 |
|-----|-----|-----|
| Step 1 | 选择登录方式 | 手机号/邮箱 |
| Step 2 | 身份验证 | 验证码/密码 |
| Step 3 | 基本信息 | 性别、年龄、身高、体重 |
| Step 4 | 健康目标 | 选择目标类型 |
| Step 5 | 完成注册 | 显示欢迎页 |

#### 2.2.2 页面元素（基本信息步骤）

| 元素 | 类型 | 必填 | 说明 |
|-----|-----|-----|-----|
| 性别选择 | Radio | 是 | 男/女 |
| 年龄输入 | InputNumber | 是 | 1-120岁 |
| 身高输入 | InputNumber | 是 | 50-250cm |
| 体重输入 | InputNumber | 是 | 20-300kg |
| 活动强度选择 | Select | 是 | 久坐/轻度/中度/高度/极度 |
| 下一步按钮 | Button | 是 | 进入目标设置 |

#### 2.2.3 目标设置步骤

| 目标类型 | 需填写字段 |
|---------|-----------|
| 减脂 | 目标体重、减脂速度 |
| 增肌 | 目标体重、训练强度 |
| 健康管理 | 关注点（多选：血糖、血压、过敏等） |
| 维持健康 | 无额外字段 |

---

### 2.3 首页 `/` - 今日概览

#### 2.3.1 移动端布局

```
┌─────────────────────────────────────┐
│  Header: 日期选择 + 通知图标          │
├─────────────────────────────────────┤
│  CalorieRingCard                    │
│  - 热量进度环                        │
│  - 已摄入/目标热量                   │
│  - 剩余热量                          │
├─────────────────────────────────────┤
│  MacrosProgressCard                 │
│  - 蛋白质进度条                      │
│  - 脂肪进度条                        │
│  - 碳水进度条                        │
├─────────────────────────────────────┤
│  FocusMetricsCard                   │
│  - 根据用户目标动态显示指标           │
├─────────────────────────────────────┤
│  QuickActions                       │
│  - [快捷添加食物] [查看详情]          │
├─────────────────────────────────────┤
│  RemindersCard（可选）               │
│  - 今日提醒列表                      │
└─────────────────────────────────────┘
```

#### 2.3.2 电脑端布局

```
┌──────────────────────────────────────────────────────────────────────────┐
│  Header: Logo + 搜索框 + 用户头像 + 通知 + 设置                           │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────┐  ┌──────────────────────────────────────────┐  │
│  │   CalorieRingCard   │  │         MacrosProgressCard               │  │
│  │   热量进度环         │  │  蛋白质 ████████░░ 80%  64/80g          │  │
│  │   + 数值详情         │  │  脂肪   ██████░░░░ 60%  40/67g          │  │
│  │                     │  │  碳水   ███████░░░ 70%  210/300g         │  │
│  └─────────────────────┘  └──────────────────────────────────────────┘  │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │   FocusMetricsCard（4个指标卡片并排）                               │ │
│  │   [糖摄入] [钠摄入] [膳食纤维] [饱和脂肪]                            │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  [快捷添加食物] [查看详情] [查看历史]                                     │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

#### 2.3.3 组件规格

##### CalorieRingCard 热量进度环卡片

| 属性 | 类型 | 说明 |
|-----|-----|-----|
| consumed | number | 已摄入热量(kcal) |
| target | number | 目标热量(kcal) |
| remaining | number | 剩余热量(kcal) |
| percentage | number | 进度百分比(0-100) |
| onDetailClick | function | 点击查看详情回调 |

**UI规格**：
- 环形进度条，直径120px（移动端）/ 180px（电脑端）
- 进度颜色：绿色(0-80%)、黄色(80-100%)、红色(>100%)
- 中心显示剩余热量数值
- 下方显示"已摄入 X / 目标 Y kcal"

##### MacrosProgressCard 三大营养素进度卡片

| 属性 | 类型 | 说明 |
|-----|-----|-----|
| protein | MacroData | 蛋白质数据 {current, target, unit} |
| fat | MacroData | 脂肪数据 |
| carbs | MacroData | 碳水数据 |

**MacroData类型**：
```typescript
interface MacroData {
  current: number;
  target: number;
  unit: string;
  percentage: number;
}
```

**UI规格**：
- 横向进度条，高度8px
- 进度条颜色：蛋白质(蓝)、脂肪(橙)、碳水(绿)
- 显示格式："蛋白质 ████████░░ 80%  64/80g"

##### FocusMetricsCard 关注指标卡片

| 属性 | 类型 | 说明 |
|-----|-----|-----|
| metrics | MetricData[] | 指标数据数组 |
| userGoal | string | 用户目标类型 |

**MetricData类型**：
```typescript
interface MetricData {
  name: string;
  current: number;
  target: number;
  unit: string;
  percentage: number;
  status: 'normal' | 'warning' | 'danger';
}
```

**动态显示逻辑**：
| 用户目标 | 显示指标 |
|---------|---------|
| 减脂 | 糖摄入、膳食纤维、饱和脂肪 |
| 增肌 | 蛋白质、碳水化合物、热量 |
| 健康管理 | 钠摄入、糖摄入、膳食纤维 |
| 维持健康 | 糖摄入、钠摄入、膳食纤维、饱和脂肪 |

#### 2.3.4 状态管理

```typescript
interface TodayOverviewState {
  date: string;
  calorie: {
    consumed: number;
    target: number;
    remaining: number;
  };
  macros: {
    protein: MacroData;
    fat: MacroData;
    carbs: MacroData;
  };
  focusMetrics: MetricData[];
  reminders: Reminder[];
  isLoading: boolean;
  lastUpdated: string;
}
```

#### 2.3.5 API调用

| 操作 | API | 说明 |
|-----|-----|-----|
| 获取今日概览 | `GET /api/nutrition/today` | 返回所有营养数据 |
| 刷新数据 | `GET /api/nutrition/today/refresh` | 强制刷新 |

---

### 2.4 食物识别入口 `/identify`

#### 2.4.1 页面布局

```
┌─────────────────────────────────────┐
│  标题: 添加食物                      │
├─────────────────────────────────────┤
│  Tab导航: [扫码] [拍照] [搜索] [快捷] │
├─────────────────────────────────────┤
│                                     │
│  Tab内容区域                         │
│                                     │
└─────────────────────────────────────┘
```

#### 2.4.2 扫码Tab

| 元素 | 类型 | 说明 |
|-----|-----|-----|
| 扫码框 | Camera | 调用摄像头扫描条形码 |
| 提示文字 | Text | "将条形码放入框内" |
| 手动输入按钮 | Button | 手动输入条形码 |
| 闪光灯开关 | IconButton | 切换闪光灯 |

**交互流程**：
1. 打开摄像头 → 2. 识别条形码 → 3. 调用API查询 → 4. 跳转识别结果页

#### 2.4.3 拍照Tab

| 元素 | 类型 | 说明 |
|-----|-----|-----|
| 拍照框 | Camera | 调用摄像头拍照 |
| 切换模式 | Toggle | 包装食品/非包装食物 |
| 相册选择 | IconButton | 从相册选择图片 |
| 拍照按钮 | Button | 拍照确认 |

**拍照模式**：
| 模式 | 说明 | 识别内容 |
|-----|-----|---------|
| 包装食品 | 拍摄配料表 | 配料表文字 → 食品信息 |
| 非包装食物 | 拍摄食物 | 食物图片 → 食物名称、估算营养 |

#### 2.4.4 搜索Tab

| 元素 | 类型 | 说明 |
|-----|-----|-----|
| 搜索框 | Input | 支持模糊搜索 |
| 搜索历史 | List | 最近搜索记录 |
| 热门搜索 | TagList | 热门食物标签 |
| 搜索结果 | List | 食物列表，支持分页 |

**搜索结果项**：
```typescript
interface FoodSearchResult {
  id: string;
  name: string;
  category: string;
  calories: number;
  protein: number;
  image?: string;
  isPackaged: boolean;
}
```

#### 2.4.5 快捷添加Tab

| 元素 | 类型 | 说明 |
|-----|-----|-----|
| 常吃食物 | List | 用户常吃食物列表 |
| 收藏食物 | List | 用户收藏的食物 |
| 最近添加 | List | 最近添加的食物 |

---

### 2.5 识别结果页 `/identify/result/:id`

#### 2.5.1 移动端布局

```
┌─────────────────────────────────────┐
│  Header: 返回 + 标题                 │
├─────────────────────────────────────┤
│  FoodInfoCard                       │
│  - 食物图片                          │
│  - 食物名称                          │
│  - 健康评分（颜色编码）               │
├─────────────────────────────────────┤
│  NutritionDetailCard                │
│  - 热量、蛋白质、脂肪、碳水           │
│  - 添加剂、钠、糖                     │
├─────────────────────────────────────┤
│  SuggestionCard                     │
│  - 根据用户目标的个性化建议            │
├─────────────────────────────────────┤
│  AlternativeCard（可选）             │
│  - 更健康的选择推荐                   │
├─────────────────────────────────────┤
│  ActionButtons                      │
│  - [添加到今日记录] [收藏] [分享]      │
├─────────────────────────────────────┤
│  AIAssistantEntry                   │
│  - [咨询AI营养师]                     │
└─────────────────────────────────────┘
```

#### 2.5.2 电脑端布局

```
┌──────────────────────────────────────────────────────────────────────────┐
│  Header: 返回 + 标题                                                      │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────┐  ┌──────────────────────────────────────────┐  │
│  │   FoodInfoCard      │  │        NutritionDetailCard               │  │
│  │   食物图片           │  │  ┌────────┬────────┬────────┬────────┐  │  │
│  │   健康评分           │  │  │ 热量   │ 蛋白质  │ 脂肪   │ 碳水   │  │  │
│  │   8.5分【优秀】      │  │  │ 150kcal│ 8g     │ 5g     │ 20g    │  │  │
│  │                     │  │  └────────┴────────┴────────┴────────┘  │  │
│  │                     │  │  添加剂: 无  钠: 200mg  糖: 5g           │  │
│  └─────────────────────┘  └──────────────────────────────────────────┘  │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │   SuggestionCard                                                   │ │
│  │   根据您的减脂目标，该食品热量适中，蛋白质含量较高...                  │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │   AlternativeCard                                                  │ │
│  │   [推荐产品1] [推荐产品2] [推荐产品3]                                 │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  [添加到今日记录] [收藏] [分享] [咨询AI营养师]                             │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

#### 2.5.3 组件规格

##### FoodInfoCard 食物信息卡片

| 属性 | 类型 | 说明 |
|-----|-----|-----|
| foodId | string | 食物ID |
| name | string | 食物名称 |
| image | string | 食物图片URL |
| healthScore | number | 健康评分(0-10) |
| healthLevel | string | 健康等级(优秀/良好/一般/较差) |
| novaClass | number | NOVA分类(1-4) |

**健康评分颜色编码**：
| 分数区间 | 颜色 | CSS变量 |
|---------|-----|---------|
| 8-10分 | 绿色 | `--color-success` |
| 6-7分 | 黄色 | `--color-warning` |
| 4-5分 | 橙色 | `--color-orange` |
| 0-3分 | 红色 | `--color-danger` |

##### NutritionDetailCard 营养详情卡片

| 属性 | 类型 | 说明 |
|-----|-----|-----|
| nutrition | NutritionInfo | 营养信息对象 |

**NutritionInfo类型**：
```typescript
interface NutritionInfo {
  calories: number;
  protein: number;
  fat: number;
  saturatedFat: number;
  carbs: number;
  fiber: number;
  sugar: number;
  sodium: number;
  additives: string[];
  servingSize: number;
  servingUnit: string;
}
```

##### SuggestionCard 建议卡片

| 属性 | 类型 | 说明 |
|-----|-----|-----|
| suggestions | Suggestion[] | 建议列表 |
| userGoal | string | 用户目标类型 |

**Suggestion类型**：
```typescript
interface Suggestion {
  type: 'positive' | 'neutral' | 'negative';
  title: string;
  content: string;
  icon?: string;
}
```

**建议内容逻辑**：
| 用户目标 | 建议维度 |
|---------|---------|
| 减脂 | 热量占比、饱腹感、热量密度 |
| 增肌 | 蛋白质密度、蛋白质质量 |
| 健康管理 | 相关健康指标（GI、钠等） |

##### AlternativeCard 替代推荐卡片

| 属性 | 类型 | 说明 |
|-----|-----|-----|
| alternatives | AlternativeFood[] | 替代食品列表 |

**AlternativeFood类型**：
```typescript
interface AlternativeFood {
  id: string;
  name: string;
  image: string;
  healthScore: number;
  calorieDiff: number;
}
```

#### 2.5.4 添加到记录交互

**交互流程**：
1. 点击"添加到今日记录" → 2. 弹出份量调整弹窗 → 3. 选择餐次 → 4. 确认添加 → 5. 显示成功提示

**份量调整弹窗**：
| 元素 | 类型 | 说明 |
|-----|-----|-----|
| 当前份量 | InputNumber | 可调整数量 |
| 单位选择 | Select | g/ml/个/份 |
| 餐次选择 | Radio | 早餐/午餐/晚餐/加餐 |
| 营养预览 | Text | 显示调整后营养值 |
| 确认按钮 | Button | 提交添加 |

#### 2.5.5 状态管理

```typescript
interface IdentifyResultState {
  foodId: string;
  foodInfo: FoodInfo | null;
  nutrition: NutritionInfo | null;
  suggestions: Suggestion[];
  alternatives: AlternativeFood[];
  isFavorited: boolean;
  isLoading: boolean;
  error: string | null;
}
```

#### 2.5.6 API调用

| 操作 | API | 说明 |
|-----|-----|-----|
| 获取食物详情 | `GET /api/foods/:id` | 返回食物完整信息 |
| 获取建议 | `GET /api/foods/:id/suggestions` | 返回个性化建议 |
| 获取替代推荐 | `GET /api/foods/:id/alternatives` | 返回替代食品列表 |
| 添加到记录 | `POST /api/records` | 添加饮食记录 |
| 收藏食物 | `POST /api/favorites` | 收藏食物 |
| 取消收藏 | `DELETE /api/favorites/:id` | 取消收藏 |

---

### 2.6 饮食记录页 `/records`

#### 2.6.1 页面布局

```
┌─────────────────────────────────────┐
│  Header: 日期选择器                   │
├─────────────────────────────────────┤
│  MealSection（按餐次分组）            │
│  ├── 早餐                            │
│  │   └── FoodItem[]                 │
│  ├── 午餐                            │
│  │   └── FoodItem[]                 │
│  ├── 晚餐                            │
│  │   └── FoodItem[]                 │
│  └── 加餐                            │
│      └── FoodItem[]                 │
├─────────────────────────────────────┤
│  DailySummary                       │
│  - 今日热量汇总                       │
│  - 营养素汇总                         │
├─────────────────────────────────────┤
│  FloatingAddButton                  │
│  - 快捷添加入口                       │
└─────────────────────────────────────┘
```

#### 2.6.2 组件规格

##### FoodItem 食物记录项

| 属性 | 类型 | 说明 |
|-----|-----|-----|
| recordId | string | 记录ID |
| foodId | string | 食物ID |
| name | string | 食物名称 |
| amount | number | 份量 |
| unit | string | 单位 |
| calories | number | 热量 |
| mealType | string | 餐次 |
| time | string | 记录时间 |

**操作**：
- 编辑份量
- 删除记录
- 查看详情

##### MealSection 餐次分组

| 属性 | 类型 | 说明 |
|-----|-----|-----|
| mealType | string | 餐次类型 |
| foods | FoodItem[] | 食物列表 |
| totalCalories | number | 该餐次总热量 |

**餐次图标**：
| 餐次 | 图标 | 时间范围 |
|-----|-----|---------|
| 早餐 | 🌅 | 6:00-9:00 |
| 午餐 | ☀️ | 11:00-14:00 |
| 晚餐 | 🌙 | 17:00-20:00 |
| 加餐 | 🍵 | 其他时间 |

#### 2.6.3 状态管理

```typescript
interface RecordsState {
  date: string;
  meals: {
    breakfast: MealData;
    lunch: MealData;
    dinner: MealData;
    snack: MealData;
  };
  dailySummary: {
    totalCalories: number;
    totalProtein: number;
    totalFat: number;
    totalCarbs: number;
  };
  isLoading: boolean;
}
```

#### 2.6.4 API调用

| 操作 | API | 说明 |
|-----|-----|-----|
| 获取日期记录 | `GET /api/records/:date` | 返回指定日期记录 |
| 更新记录 | `PUT /api/records/:id` | 更新记录份量 |
| 删除记录 | `DELETE /api/records/:id` | 删除记录 |
| 复制到今日 | `POST /api/records/copy` | 复制历史记录 |

---

### 2.7 个人中心 `/profile`

#### 2.7.1 页面布局

```
┌─────────────────────────────────────┐
│  UserCard                           │
│  - 头像                              │
│  - 昵称                              │
│  - 目标类型标签                       │
├─────────────────────────────────────┤
│  GoalProgressCard                   │
│  - 目标进度                          │
│  - 当前体重 → 目标体重                │
├─────────────────────────────────────┤
│  MenuList                           │
│  ├── 个人信息                        │
│  ├── 健康目标                        │
│  ├── 我的收藏                        │
│  ├── 数据报告                        │
│  ├── 设置                            │
│  └── 关于我们                        │
└─────────────────────────────────────┘
```

#### 2.7.2 用户信息编辑

**可编辑字段**：
| 字段 | 类型 | 校验规则 |
|-----|-----|---------|
| 昵称 | string | 2-20字符 |
| 头像 | file | jpg/png, <2MB |
| 性别 | enum | 男/女 |
| 年龄 | number | 1-120 |
| 身高 | number | 50-250cm |
| 体重 | number | 20-300kg |
| 活动强度 | enum | 久坐/轻度/中度/高度/极度 |

#### 2.7.3 目标设置

**目标类型配置**：
```typescript
interface GoalConfig {
  type: 'weight_loss' | 'muscle_gain' | 'health' | 'maintain';
  targetWeight?: number;
  weeklyTarget?: number;
  healthFocus?: string[];
  allergies?: string[];
}
```

---

### 2.8 AI营养师 `/ai-assistant`

#### 2.8.1 页面布局

```
┌─────────────────────────────────────┐
│  Header: AI营养师                    │
├─────────────────────────────────────┤
│  ChatMessages                       │
│  - 消息列表（用户/AI）                │
│  - 支持滚动加载历史                   │
├─────────────────────────────────────┤
│  QuickQuestions                     │
│  - 快捷问题标签                       │
│  - 根据用户数据动态生成                │
├─────────────────────────────────────┤
│  InputArea                          │
│  - 输入框                            │
│  - 语音输入按钮（移动端）              │
│  - 发送按钮                          │
└─────────────────────────────────────┘
```

#### 2.8.2 消息类型

```typescript
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  type: 'text' | 'food_card' | 'suggestion';
  foodData?: FoodInfo;
}
```

#### 2.8.3 快捷问题

**动态生成逻辑**：
| 用户目标 | 快捷问题示例 |
|---------|------------|
| 减脂 | "今天还能吃多少热量？"、"推荐低卡晚餐" |
| 增肌 | "今天蛋白质够吗？"、"推荐高蛋白食物" |
| 健康管理 | "今天钠摄入超标了吗？"、"适合糖尿病的食物" |

#### 2.8.4 API调用

| 操作 | API | 说明 |
|-----|-----|-----|
| 发送消息 | `POST /api/ai/chat` | 发送消息，返回AI回复 |
| 获取历史 | `GET /api/ai/history` | 获取聊天历史 |
| 获取快捷问题 | `GET /api/ai/quick-questions` | 获取动态快捷问题 |

---

## 3. 公共组件规格

### 3.1 导航组件

#### 3.1.1 BottomNav 底部导航（移动端）

| 属性 | 类型 | 说明 |
|-----|-----|-----|
| activeTab | string | 当前激活的Tab |
| onTabChange | function | Tab切换回调 |

**Tab配置**：
```typescript
const tabs = [
  { key: 'home', icon: 'home', label: '首页', path: '/' },
  { key: 'identify', icon: 'camera', label: '识别', path: '/identify' },
  { key: 'records', icon: 'list', label: '记录', path: '/records' },
  { key: 'profile', icon: 'user', label: '我的', path: '/profile' },
];
```

#### 3.1.2 Sidebar 侧边导航（电脑端）

| 属性 | 类型 | 说明 |
|-----|-----|-----|
| collapsed | boolean | 是否折叠 |
| onCollapse | function | 折叠状态切换回调 |
| activeKey | string | 当前激活菜单 |

**菜单配置**：
```typescript
const menuItems = [
  { key: 'home', icon: 'home', label: '首页', path: '/' },
  { key: 'identify', icon: 'camera', label: '识别', path: '/identify' },
  { key: 'records', icon: 'list', label: '记录', path: '/records' },
  { key: 'report', icon: 'chart', label: '报告', path: '/report' },
  { key: 'profile', icon: 'user', label: '我的', path: '/profile' },
  { type: 'divider' },
  { key: 'settings', icon: 'setting', label: '设置', path: '/settings' },
];
```

#### 3.1.3 Header 顶部栏（电脑端）

| 属性 | 类型 | 说明 |
|-----|-----|-----|
| user | UserInfo | 用户信息 |
| notifications | number | 未读通知数 |
| onSearch | function | 搜索回调 |

**元素**：
- Logo
- 搜索框
- 通知图标（带红点）
- 用户头像（下拉菜单）

### 3.2 数据展示组件

#### 3.2.1 ProgressRing 进度环

| 属性 | 类型 | 默认值 | 说明 |
|-----|-----|-------|-----|
| percentage | number | 0 | 进度百分比(0-100) |
| size | number | 120 | 环形直径(px) |
| strokeWidth | number | 8 | 环形宽度(px) |
| color | string | - | 进度颜色，不传则自动计算 |
| showLabel | boolean | true | 是否显示中心文字 |
| label | string | - | 中心显示的文字 |

**颜色自动计算规则**：
```typescript
const getProgressColor = (percentage: number): string => {
  if (percentage <= 80) return 'var(--color-success)';
  if (percentage <= 100) return 'var(--color-warning)';
  return 'var(--color-danger)';
};
```

#### 3.2.2 ProgressBar 进度条

| 属性 | 类型 | 默认值 | 说明 |
|-----|-----|-------|-----|
| percentage | number | 0 | 进度百分比 |
| height | number | 8 | 进度条高度(px) |
| color | string | - | 进度颜色 |
| showLabel | boolean | true | 是否显示百分比 |
| label | string | - | 自定义标签文字 |

#### 3.2.3 HealthScore 健康评分

| 属性 | 类型 | 说明 |
|-----|-----|-----|
| score | number | 评分(0-10) |
| size | 'small' \| 'medium' \| 'large' | 尺寸 |
| showLabel | boolean | 是否显示等级文字 |

**显示规格**：
| 尺寸 | 字体大小 | 圆形直径 |
|-----|---------|---------|
| small | 14px | 40px |
| medium | 18px | 60px |
| large | 24px | 80px |

#### 3.2.4 MetricCard 指标卡片

| 属性 | 类型 | 说明 |
|-----|-----|-----|
| title | string | 指标名称 |
| current | number | 当前值 |
| target | number | 目标值 |
| unit | string | 单位 |
| status | 'normal' \| 'warning' \| 'danger' | 状态 |

### 3.3 表单组件

#### 3.3.1 FormInput 输入框

| 属性 | 类型 | 说明 |
|-----|-----|-----|
| label | string | 标签文字 |
| placeholder | string | 占位文字 |
| type | string | 输入类型 |
| value | string | 值 |
| onChange | function | 值变化回调 |
| error | string | 错误信息 |
| required | boolean | 是否必填 |
| disabled | boolean | 是否禁用 |

#### 3.3.2 FormSelect 选择器

| 属性 | 类型 | 说明 |
|-----|-----|-----|
| options | Option[] | 选项列表 |
| value | string | 当前值 |
| onChange | function | 值变化回调 |
| placeholder | string | 占位文字 |

#### 3.3.3 FormNumberInput 数字输入框

| 属性 | 类型 | 说明 |
|-----|-----|-----|
| min | number | 最小值 |
| max | number | 最大值 |
| step | number | 步进值 |
| unit | string | 单位显示 |

### 3.4 反馈组件

#### 3.4.1 Toast 轻提示

| 属性 | 类型 | 说明 |
|-----|-----|-----|
| message | string | 提示内容 |
| type | 'success' \| 'error' \| 'warning' \| 'info' | 类型 |
| duration | number | 显示时长(ms) |

#### 3.4.2 Modal 弹窗

| 属性 | 类型 | 说明 |
|-----|-----|-----|
| visible | boolean | 是否显示 |
| title | string | 标题 |
| content | ReactNode | 内容 |
| onConfirm | function | 确认回调 |
| onCancel | function | 取消回调 |

#### 3.4.3 Loading 加载

| 属性 | 类型 | 说明 |
|-----|-----|-----|
| fullscreen | boolean | 是否全屏 |
| text | string | 加载文字 |

---

## 4. API接口需求清单

### 4.1 认证模块

| 接口 | 方法 | 路径 | 请求体 | 响应体 |
|-----|-----|-----|-------|-------|
| 发送验证码 | POST | `/api/auth/sms` | `{phone}` | `{success}` |
| 手机号登录 | POST | `/api/auth/login/phone` | `{phone, code}` | `{token, user}` |
| 邮箱登录 | POST | `/api/auth/login/email` | `{email, password}` | `{token, user}` |
| 注册 | POST | `/api/auth/register` | `{phone/email, ...}` | `{token, user}` |
| 获取用户信息 | GET | `/api/auth/me` | - | `{user}` |
| 更新用户信息 | PUT | `/api/auth/me` | `{...fields}` | `{user}` |
| 退出登录 | POST | `/api/auth/logout` | - | `{success}` |

### 4.2 食物模块

| 接口 | 方法 | 路径 | 请求体 | 响应体 |
|-----|-----|-----|-------|-------|
| 搜索食物 | GET | `/api/foods/search?q={keyword}` | - | `{foods[], total}` |
| 获取食物详情 | GET | `/api/foods/:id` | - | `{food}` |
| 条形码查询 | GET | `/api/foods/barcode/:code` | - | `{food}` |
| 图片识别 | POST | `/api/foods/recognize` | `{image}` | `{food}` |
| 获取建议 | GET | `/api/foods/:id/suggestions` | - | `{suggestions[]}` |
| 获取替代推荐 | GET | `/api/foods/:id/alternatives` | - | `{alternatives[]}` |

### 4.3 记录模块

| 接口 | 方法 | 路径 | 请求体 | 响应体 |
|-----|-----|-----|-------|-------|
| 获取日期记录 | GET | `/api/records/:date` | - | `{records[]}` |
| 添加记录 | POST | `/api/records` | `{foodId, amount, mealType}` | `{record}` |
| 更新记录 | PUT | `/api/records/:id` | `{amount}` | `{record}` |
| 删除记录 | DELETE | `/api/records/:id` | - | `{success}` |

### 4.4 营养模块

| 接口 | 方法 | 路径 | 请求体 | 响应体 |
|-----|-----|-----|-------|-------|
| 获取今日概览 | GET | `/api/nutrition/today` | - | `{overview}` |
| 获取营养详情 | GET | `/api/nutrition/:date` | - | `{detail}` |
| 获取趋势数据 | GET | `/api/nutrition/trend?range={range}` | - | `{trend[]}` |

### 4.5 AI模块

| 接口 | 方法 | 路径 | 请求体 | 响应体 |
|-----|-----|-----|-------|-------|
| 发送消息 | POST | `/api/ai/chat` | `{message, context}` | `{reply}` |
| 获取历史 | GET | `/api/ai/history` | - | `{messages[]}` |
| 获取快捷问题 | GET | `/api/ai/quick-questions` | - | `{questions[]}` |

### 4.6 收藏模块

| 接口 | 方法 | 路径 | 请求体 | 响应体 |
|-----|-----|-----|-------|-------|
| 获取收藏列表 | GET | `/api/favorites` | - | `{foods[]}` |
| 添加收藏 | POST | `/api/favorites` | `{foodId}` | `{favorite}` |
| 取消收藏 | DELETE | `/api/favorites/:foodId` | - | `{success}` |

---

## 5. 状态管理设计

### 5.1 Store结构

```typescript
interface RootStore {
  auth: AuthStore;
  nutrition: NutritionStore;
  records: RecordsStore;
  food: FoodStore;
  ui: UIStore;
}
```

### 5.2 AuthStore 认证状态

```typescript
interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<User>) => Promise<void>;
  fetchUser: () => Promise<void>;
}
```

### 5.3 NutritionStore 营养状态

```typescript
interface NutritionStore {
  todayOverview: TodayOverview | null;
  nutritionDetail: NutritionDetail | null;
  trendData: TrendData[];
  isLoading: boolean;
  
  // Actions
  fetchTodayOverview: () => Promise<void>;
  fetchNutritionDetail: (date: string) => Promise<void>;
  fetchTrendData: (range: string) => Promise<void>;
  refreshTodayData: () => Promise<void>;
}
```

### 5.4 RecordsStore 记录状态

```typescript
interface RecordsStore {
  records: Record<string, DailyRecords>;
  currentDate: string;
  isLoading: boolean;
  
  // Actions
  fetchRecords: (date: string) => Promise<void>;
  addRecord: (data: AddRecordData) => Promise<void>;
  updateRecord: (id: string, data: UpdateRecordData) => Promise<void>;
  deleteRecord: (id: string) => Promise<void>;
}
```

### 5.5 FoodStore 食物状态

```typescript
interface FoodStore {
  searchResults: FoodSearchResult[];
  recentSearches: string[];
  favorites: Food[];
  currentFood: FoodDetail | null;
  
  // Actions
  searchFood: (keyword: string) => Promise<void>;
  fetchFoodDetail: (id: string) => Promise<void>;
  fetchFavorites: () => Promise<void>;
  addFavorite: (foodId: string) => Promise<void>;
  removeFavorite: (foodId: string) => Promise<void>;
}
```

### 5.6 UIStore UI状态

```typescript
interface UIStore {
  sidebarCollapsed: boolean;
  activeTab: string;
  theme: 'light' | 'dark';
  deviceType: 'mobile' | 'tablet' | 'desktop';
  
  // Actions
  toggleSidebar: () => void;
  setActiveTab: (tab: string) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setDeviceType: (type: 'mobile' | 'tablet' | 'desktop') => void;
}
```

---

## 6. 响应式设计规范

### 6.1 断点定义

```css
/* 断点变量 */
--breakpoint-mobile: 576px;
--breakpoint-tablet: 768px;
--breakpoint-desktop: 1200px;
--breakpoint-wide: 1920px;
```

### 6.2 媒体查询

```css
/* 移动端 */
@media (max-width: 575px) { }

/* 平板 */
@media (min-width: 576px) and (max-width: 767px) { }

/* 小屏电脑/平板横屏 */
@media (min-width: 768px) and (max-width: 1199px) { }

/* 大屏电脑 */
@media (min-width: 1200px) { }

/* 超大屏 */
@media (min-width: 1920px) { }
```

### 6.3 布局适配规则

#### 6.3.1 导航适配

| 设备 | 导航组件 | 显示方式 |
|-----|---------|---------|
| 移动端 | BottomNav | 固定底部，4个Tab |
| 平板 | BottomNav + 抽屉 | 底部导航 + 侧滑菜单 |
| 电脑端 | Sidebar | 左侧固定，可折叠 |

#### 6.3.2 内容布局适配

| 组件 | 移动端 | 平板 | 电脑端 |
|-----|-------|-----|-------|
| 卡片列表 | 单列 | 2列网格 | 多列网格 |
| 表单 | 单列，标签在上 | 单列 | 多列，标签在左 |
| 表格 | 卡片列表 | 精简表格 | 完整表格 |
| 图表 | 小尺寸，单图 | 中等尺寸 | 大尺寸，多图并排 |

### 6.4 字体大小适配

```css
/* 移动端 */
--font-size-xs: 12px;
--font-size-sm: 14px;
--font-size-base: 16px;
--font-size-lg: 18px;
--font-size-xl: 20px;

/* 电脑端 */
--font-size-xs: 14px;
--font-size-sm: 16px;
--font-size-base: 18px;
--font-size-lg: 20px;
--font-size-xl: 24px;
```

### 6.5 间距适配

```css
/* 移动端 */
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 12px;
--spacing-lg: 16px;
--spacing-xl: 24px;

/* 电脑端 */
--spacing-xs: 8px;
--spacing-sm: 12px;
--spacing-md: 16px;
--spacing-lg: 24px;
--spacing-xl: 32px;
```

---

## 7. UI设计规范

### 7.1 色彩系统

#### 7.1.1 主色调

| 名称 | 色值 | 用途 |
|-----|-----|-----|
| Primary | #22C55E | 主色，健康、活力 |
| Primary-Light | #86EFAC | 主色浅色 |
| Primary-Dark | #16A34A | 主色深色 |

#### 7.1.2 辅助色

| 名称 | 色值 | 用途 |
|-----|-----|-----|
| Secondary | #3B82F6 | 辅助色，专业、科技 |
| Success | #22C55E | 成功状态 |
| Warning | #F59E0B | 警告状态 |
| Danger | #EF4444 | 危险状态 |
| Info | #3B82F6 | 信息状态 |

#### 7.1.3 中性色

| 名称 | 色值 | 用途 |
|-----|-----|-----|
| Gray-50 | #F9FAFB | 背景色 |
| Gray-100 | #F3F4F6 | 次级背景 |
| Gray-200 | #E5E7EB | 边框色 |
| Gray-300 | #D1D5DB | 分割线 |
| Gray-400 | #9CA3AF | 禁用文字 |
| Gray-500 | #6B7280 | 次级文字 |
| Gray-600 | #4B5563 | 正文文字 |
| Gray-700 | #374151 | 标题文字 |
| Gray-800 | #1F2937 | 深色文字 |
| Gray-900 | #111827 | 最深文字 |

### 7.2 字体规范

#### 7.2.1 字体家族

```css
--font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 
  'Helvetica Neue', Arial, 'Noto Sans SC', sans-serif;
```

#### 7.2.2 字体大小

| 名称 | 大小 | 行高 | 用途 |
|-----|-----|-----|-----|
| xs | 12px | 16px | 辅助文字 |
| sm | 14px | 20px | 次级文字 |
| base | 16px | 24px | 正文 |
| lg | 18px | 28px | 小标题 |
| xl | 20px | 28px | 标题 |
| 2xl | 24px | 32px | 大标题 |
| 3xl | 30px | 36px | 页面标题 |

### 7.3 圆角规范

| 名称 | 大小 | 用途 |
|-----|-----|-----|
| sm | 4px | 小元素（标签、徽章） |
| md | 8px | 按钮、输入框 |
| lg | 12px | 卡片 |
| xl | 16px | 大卡片、弹窗 |
| full | 9999px | 圆形元素 |

### 7.4 阴影规范

| 名称 | 值 | 用途 |
|-----|-----|-----|
| sm | 0 1px 2px rgba(0,0,0,0.05) | 轻微阴影 |
| md | 0 4px 6px rgba(0,0,0,0.1) | 卡片阴影 |
| lg | 0 10px 15px rgba(0,0,0,0.1) | 弹窗阴影 |
| xl | 0 20px 25px rgba(0,0,0,0.15) | 模态框阴影 |

### 7.5 图标规范

- 图标库：Lucide Icons / Heroicons
- 尺寸：16px / 20px / 24px / 32px
- 风格：线性图标，stroke-width: 2

### 7.6 动效规范

#### 7.6.1 过渡时间

| 名称 | 时长 | 用途 |
|-----|-----|-----|
| fast | 150ms | 按钮点击、hover |
| normal | 300ms | 弹窗、抽屉 |
| slow | 500ms | 页面切换 |

#### 7.6.2 缓动函数

```css
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in: cubic-bezier(0.4, 0, 1, 1);
```

---

## 8. 开发优先级

### 8.1 P0 - MVP（第1-2周）

| 模块 | 页面/组件 | 说明 |
|-----|---------|-----|
| 认证 | 登录页、注册页 | 手机号登录、基本信息填写 |
| 首页 | 今日概览 | 热量进度环、营养进度条 |
| 识别 | 搜索入口、结果页 | 手动搜索、食物详情展示 |
| 记录 | 今日记录 | 添加、查看、删除记录 |
| 个人 | 个人中心、目标设置 | 基本信息编辑 |
| 布局 | 响应式布局 | 移动端/电脑端适配 |

### 8.2 P1 - 重要功能（第3-4周）

| 模块 | 页面/组件 | 说明 |
|-----|---------|-----|
| 识别 | 扫码、拍照 | 条形码扫描、图片识别 |
| 营养 | 营养详情页 | 完整营养素展示 |
| AI | AI营养师 | 基础问答功能 |
| 提醒 | 提醒中心 | 营养提醒展示 |
| PWA | PWA基础 | 安装、离线访问 |

### 8.3 P2 - 次要功能（第5-6周）

| 模块 | 页面/组件 | 说明 |
|-----|---------|-----|
| 报告 | 日报、周报 | 数据报告生成 |
| 收藏 | 收藏夹 | 收藏管理 |
| 趋势 | 趋势分析 | 数据可视化 |
| 主题 | 暗色模式 | 主题切换 |

### 8.4 P3 - 可选功能（后续迭代）

| 模块 | 页面/组件 | 说明 |
|-----|---------|-----|
| 社交 | 打卡、成就 | 社交激励功能 |
| 分享 | 分享功能 | 社交平台分享 |
| 推送 | Web Push | 推送通知 |

---

## 9. 技术要点

### 9.1 性能优化

- 路由懒加载
- 图片懒加载 + CDN加速
- 虚拟列表（长列表场景）
- 防抖/节流（搜索输入）
- 缓存策略（SWR/React Query）

### 9.2 无障碍支持

- 语义化HTML标签
- ARIA属性
- 键盘导航支持
- 足够的颜色对比度

### 9.3 错误处理

- 全局错误边界
- API错误统一处理
- 网络断开提示
- 表单校验错误提示

### 9.4 安全措施

- XSS防护（输入过滤、输出编码）
- CSRF Token
- 敏感数据不存储在localStorage
- HTTPS强制跳转

---

## 10. 版本历史

| 版本 | 日期 | 变更内容 |
|-----|-----|---------|
| v7a.1 | 2024-03-28 | 基于需求文档v6.1创建前端专用需求文档，包含页面规格、组件设计、API接口、状态管理等 |
