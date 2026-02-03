# 豆包API凭证配置说明

## 1. 获取豆包API凭证

### 1.1 注册和登录
1. 访问火山引擎官网：https://www.volcengine.com/
2. 注册账号并登录
3. 进入控制台

### 1.2 创建应用
1. 在控制台中找到"语音服务"或"豆包语音"
2. 进入"应用管理"
3. 点击"创建应用"
4. 填写应用信息：
   - 应用名称：如"Live2D金华唤醒"
   - 应用描述：语音唤醒词检测
5. 创建成功后，获取以下凭证：
   - **APP_KEY**（应用ID）
   - **ACCESS_KEY**（访问密钥）

### 1.3 选择资源ID
根据您的需求选择资源ID：

**豆包流式语音识别模型1.0**：
- 小时版：`volc.bigasr.sauc.duration`
- 并发版：`volc.bigasr.sauc.concurrent`

**豆包流式语音识别模型2.0**（推荐）：
- 小时版：`volc.seedasr.sauc.duration`
- 并发版：`volc.seedasr.sauc.concurrent`

**建议**：
- 如果是持续运行的唤醒词检测，建议使用**并发版**
- 如果使用时长较短，可以使用**小时版**

## 2. 配置凭证

### 2.1 方案一：直接配置（简单，不推荐用于生产环境）

在 `js/doubao-wakeup/doubao-config.js` 中直接填入：

```javascript
export const DOUBAO_CONFIG = {
    WS_URL: 'wss://openspeech.bytedance.com/api/v3/sauc/bigmodel_async',

    // 直接填入凭证
    APP_KEY: '123456789',  // 替换为您的APP_KEY
    ACCESS_KEY: 'your-access-key-here',  // 替换为您的ACCESS_KEY
    RESOURCE_ID: 'volc.seedasr.sauc.concurrent',  // 选择合适的资源ID

    WAKEUP_WORD: '湖宝湖宝',
    WAKEUP_KEYWORDS: ['湖宝湖宝', '湖宝', '胡宝胡宝'],

    AUDIO_FORMAT: 'pcm',
    AUDIO_RATE: 16000,
    AUDIO_BITS: 16,
    AUDIO_CHANNEL: 1,

    ENABLE_ITN: true,
    ENABLE_PUNC: false,
    ENABLE_DDC: false,
}
```

**注意**：此方案会将凭证暴露在代码中，不适合提交到公开的git仓库。

### 2.2 方案二：环境变量配置（推荐）

#### 步骤1：创建 `.env` 文件

在项目根目录创建 `.env` 文件（不要提交到git）：

```env
# 豆包API凭证
DOUBAO_APP_KEY=123456789
DOUBAO_ACCESS_KEY=your-access-key-here
DOUBAO_RESOURCE_ID=volc.seedasr.sauc.concurrent
```

#### 步骤2：添加到 `.gitignore`

确保 `.env` 文件不会被提交到git：

```gitignore
# 环境变量文件
.env
.env.local
.env.*.local
```

#### 步骤3：修改 `doubao-config.js`

```javascript
// 从环境变量读取凭证
export const DOUBAO_CONFIG = {
    WS_URL: 'wss://openspeech.bytedance.com/api/v3/sauc/bigmodel_async',

    // 从环境变量读取（需要构建工具支持，如Vite、Webpack等）
    APP_KEY: import.meta.env.VITE_DOUBAO_APP_KEY || process.env.DOUBAO_APP_KEY,
    ACCESS_KEY: import.meta.env.VITE_DOUBAO_ACCESS_KEY || process.env.DOUBAO_ACCESS_KEY,
    RESOURCE_ID: import.meta.env.VITE_DOUBAO_RESOURCE_ID || process.env.DOUBAO_RESOURCE_ID,

    WAKEUP_WORD: '湖宝湖宝',
    WAKEUP_KEYWORDS: ['湖宝湖宝', '湖宝', '胡宝胡宝'],

    AUDIO_FORMAT: 'pcm',
    AUDIO_RATE: 16000,
    AUDIO_BITS: 16,
    AUDIO_CHANNEL: 1,

    ENABLE_ITN: true,
    ENABLE_PUNC: false,
    ENABLE_DDC: false,
}
```

**注意**：由于您的项目是静态Web应用，可能不支持环境变量。如果不使用构建工具，请使用方案一或方案三。

### 2.3 方案三：独立配置文件（推荐用于静态项目）

#### 步骤1：创建 `doubao-credentials.js`

在 `js/doubao-wakeup/` 目录下创建 `doubao-credentials.js`：

```javascript
// 豆包API凭证配置
// 注意：此文件不要提交到git仓库
export const DOUBAO_CREDENTIALS = {
    APP_KEY: '123456789',  // 替换为您的APP_KEY
    ACCESS_KEY: 'your-access-key-here',  // 替换为您的ACCESS_KEY
    RESOURCE_ID: 'volc.seedasr.sauc.concurrent',  // 选择合适的资源ID
}
```

#### 步骤2：添加到 `.gitignore`

```gitignore
# 豆包凭证文件
js/doubao-wakeup/doubao-credentials.js
```

#### 步骤3：创建模板文件 `doubao-credentials.example.js`

```javascript
// 豆包API凭证配置模板
// 使用说明：
// 1. 复制此文件为 doubao-credentials.js
// 2. 填入您的真实凭证
// 3. doubao-credentials.js 不会被提交到git
export const DOUBAO_CREDENTIALS = {
    APP_KEY: '',  // 请填入您的APP_KEY
    ACCESS_KEY: '',  // 请填入您的ACCESS_KEY
    RESOURCE_ID: 'volc.seedasr.sauc.concurrent',  // 选择合适的资源ID
}
```

#### 步骤4：修改 `doubao-config.js`

```javascript
import { DOUBAO_CREDENTIALS } from './doubao-credentials.js'

export const DOUBAO_CONFIG = {
    WS_URL: 'wss://openspeech.bytedance.com/api/v3/sauc/bigmodel_async',

    // 从独立配置文件读取凭证
    ...DOUBAO_CREDENTIALS,

    WAKEUP_WORD: '湖宝湖宝',
    WAKEUP_KEYWORDS: ['湖宝湖宝', '湖宝', '胡宝胡宝'],

    AUDIO_FORMAT: 'pcm',
    AUDIO_RATE: 16000,
    AUDIO_BITS: 16,
    AUDIO_CHANNEL: 1,

    ENABLE_ITN: true,
    ENABLE_PUNC: false,
    ENABLE_DDC: false,
}
```

## 3. 推荐配置方案

根据您的项目情况，推荐使用**方案三**：

### 优势
1. ✅ 凭证与代码分离
2. ✅ 不会意外提交到git
3. ✅ 适合静态Web项目
4. ✅ 团队成员可以使用各自的凭证
5. ✅ 提供模板文件，方便部署

### 实施步骤
1. 创建 `js/doubao-wakeup/doubao-credentials.example.js`（提交到git）
2. 复制为 `doubao-credentials.js` 并填入真实凭证（不提交）
3. 在 `.gitignore` 中添加 `doubao-credentials.js`
4. 在 `doubao-config.js` 中引入凭证

## 4. 凭证安全注意事项

### 4.1 不要泄露凭证
- ❌ 不要将凭证提交到公开的git仓库
- ❌ 不要在截图、日志中暴露凭证
- ❌ 不要在前端代码中硬编码凭证（如果是公开项目）

### 4.2 定期更新凭证
- 定期在火山引擎控制台更新ACCESS_KEY
- 如果凭证泄露，立即重置

### 4.3 权限控制
- 在火山引擎控制台设置IP白名单（如果支持）
- 限制API调用频率和配额

## 5. 测试凭证配置

创建一个测试文件 `test-doubao-credentials.js`：

```javascript
import { DOUBAO_CONFIG } from './js/doubao-wakeup/doubao-config.js'

console.log('豆包配置测试：')
console.log('APP_KEY:', DOUBAO_CONFIG.APP_KEY ? '✓ 已配置' : '✗ 未配置')
console.log('ACCESS_KEY:', DOUBAO_CONFIG.ACCESS_KEY ? '✓ 已配置' : '✗ 未配置')
console.log('RESOURCE_ID:', DOUBAO_CONFIG.RESOURCE_ID)
console.log('唤醒词:', DOUBAO_CONFIG.WAKEUP_WORD)

if (!DOUBAO_CONFIG.APP_KEY || !DOUBAO_CONFIG.ACCESS_KEY) {
    console.error('错误：请先配置豆包API凭证！')
    console.log('请参考 豆包API凭证配置说明.md')
}
```

在浏览器控制台运行，检查配置是否正确。

## 6. 常见问题

### Q1: 如何获取APP_KEY和ACCESS_KEY？
A: 登录火山引擎控制台 → 语音服务 → 应用管理 → 创建应用 → 查看凭证

### Q2: 小时版和并发版有什么区别？
A:
- **小时版**：按识别时长计费，适合使用时长较短的场景
- **并发版**：按并发路数计费，适合持续运行的场景（如唤醒词检测）

### Q3: 凭证配置后无法连接怎么办？
A:
1. 检查凭证是否正确
2. 检查RESOURCE_ID是否与控制台一致
3. 查看浏览器控制台的错误信息
4. 确认账户余额充足

### Q4: 可以在前端直接使用凭证吗？
A:
- 如果是内部项目或本地运行，可以直接使用
- 如果是公开项目，建议通过后端代理，避免凭证泄露

## 7. 部署清单

部署前请确认：

- [ ] 已获取豆包API凭证（APP_KEY、ACCESS_KEY）
- [ ] 已选择合适的RESOURCE_ID
- [ ] 已创建 `doubao-credentials.js` 并填入凭证
- [ ] 已将 `doubao-credentials.js` 添加到 `.gitignore`
- [ ] 已测试凭证配置是否正确
- [ ] 已确认账户余额充足

---

**相关文档**：
- 豆包唤醒词集成方案.md
- 豆包唤醒词方案总结.md
