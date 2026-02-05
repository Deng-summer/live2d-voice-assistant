# 豆包唤醒词集成到金华项目

## 集成完成 ✅

已成功将豆包唤醒词集成到金华项目的主流程 `control.js` 中，替换了原来的按键唤醒（Enter 键）。

## 修改内容

### 1. 导入豆包唤醒词模块

```javascript
import { startWakeupDetection, stopWakeupDetection } from '../doubao-wakeup/doubao-wakeup.js'
```

### 2. 启动豆包唤醒词检测

在系统加载完成后（3秒后），自动启动豆包唤醒词检测：

```javascript
setTimeout(()=>{
    enterMode('BUS')
    // 启动豆包唤醒词检测
    startDoubaoWakeup()
},systemLoadingTime)
```

### 3. 唤醒流程

```
豆包检测到唤醒词 → onDoubaoWakeup() → 进入 READY 模式 → latConnectWebSocket()
                                                              ↓
                                                        开启讯飞语音识别
```

### 4. 降级机制

如果豆包唤醒词启动失败，会自动降级到按键唤醒模式（Enter 键）：

```javascript
catch (error) {
    console.error('❌ 豆包唤醒词启动失败:', error)
    console.log('降级到按键唤醒模式')
    // 降级到按键唤醒
    document.addEventListener('keydown', wakeupDetect)
}
```

## 使用方法

### 1. 启动 Token 服务器

在 `js/doubao-wakeup` 目录下：

```bash
npm run token
```

### 2. 启动主应用

```bash
http-server .
```

### 3. 访问主页面

```
http://127.0.0.1:8080/index.html
```

### 4. 测试唤醒

1. 等待系统加载完成（3秒）
2. 允许麦克风权限
3. 说出唤醒词："湖宝湖宝"、"湖宝"、"胡宝胡宝"
4. 系统自动进入 READY 模式，开启讯飞语音识别
5. 可以开始对话

## 工作流程

```
┌─────────────────────────────────────────────────────────┐
│  金华项目启动流程                                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. 系统加载（3秒）                                     │
│     ↓                                                   │
│  2. 进入 BUS 模式（报站模式）                           │
│     ↓                                                   │
│  3. 启动豆包唤醒词检测                                  │
│     ├─ 连接 Token 服务器                               │
│     ├─ 获取 JWT Token                                  │
│     ├─ 连接豆包 WebSocket                              │
│     └─ 开始监听唤醒词                                   │
│     ↓                                                   │
│  4. 等待唤醒词                                          │
│     ↓                                                   │
│  5. 检测到唤醒词："湖宝湖宝"                            │
│     ↓                                                   │
│  6. 进入 READY 模式（唤醒模式）                         │
│     ↓                                                   │
│  7. 启动讯飞语音识别                                    │
│     ↓                                                   │
│  8. 用户说话 → 讯飞识别 → 判断模式                     │
│     ├─ "音乐" → MUSIC 模式                             │
│     ├─ "小可" → MULTI 模式（多轮对话）                 │
│     ├─ 其他 → SINGEL 模式（单轮对话）                  │
│     └─ "退出" → 返回 BUS 模式                          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## 配置说明

### 唤醒词配置

在 `js/doubao-wakeup/doubao-config.js` 中配置：

```javascript
// 主唤醒词
WAKEUP_WORD: '湖宝湖宝',

// 支持的唤醒词列表（模糊匹配）
WAKEUP_KEYWORDS: ['湖宝湖宝', '湖宝', '胡宝胡宝'],
```

### 凭证配置

在 `js/doubao-wakeup/doubao-credentials.js` 中配置：

```javascript
export const DOUBAO_CREDENTIALS = {
    APP_KEY: '4145251174',
    ACCESS_KEY: 'LpK1fJ6uG4frTjWqMiZZ7Jp8agvDeSAW',
    RESOURCE_ID: 'volc.seedasr.sauc.duration',
}
```

## 调试日志

### 浏览器控制台

```
正在启动豆包唤醒词检测...
[豆包唤醒] 正在获取 JWT Token...
[豆包唤醒] JWT Token 获取成功
[豆包唤醒] WebSocket URL 已构建
[豆包唤醒] WebSocket已连接
✓ 豆包唤醒词检测已启动
✓ 检测到唤醒词: 湖宝湖宝
```

### Token 服务器日志

```
🔄 获取新的 Token...
✅ JWT Token 获取成功
  Token: eyJhbGciOiJIUzI1NiIs...
```

## 优势对比

### 原来的按键唤醒

- ❌ 需要手动按 Enter 键
- ❌ 不够自然
- ❌ 需要靠近电脑

### 现在的语音唤醒

- ✅ 自动检测唤醒词
- ✅ 自然交互
- ✅ 远距离唤醒
- ✅ 持续监听（低成本）
- ✅ 自动降级（失败时使用按键）

## 成本控制

### 豆包唤醒词

- **计费方式**：按识别时长计费
- **优化措施**：
  - Token 缓存（1小时）
  - 只在 BUS 模式下监听
  - 唤醒后自动停止豆包检测
  - 使用讯飞进行后续识别

### 讯飞语音识别

- 保持原有的讯飞 IAT 用于对话识别
- 成本和功能不变

## 故障排查

### 1. 豆包唤醒词无法启动

**检查**：
- Token 服务器是否运行？
- 凭证是否正确？
- 网络是否正常？
- 浏览器控制台是否有错误？

**解决**：
- 系统会自动降级到按键唤醒
- 按 Enter 键仍可唤醒

### 2. 检测不到唤醒词

**检查**：
- 麦克风权限是否允许？
- 说话音量是否足够？
- 唤醒词是否正确？

**调试**：
- 打开 `doubao-config.js` 中的 `DEBUG: true`
- 查看控制台的识别结果

### 3. Token 服务器连接失败

**检查**：
- Token 服务器是否在运行？
- 端口 3001 是否可访问？
- 是否有防火墙阻止？

## 下一步优化

1. ✅ 集成完成
2. 🔄 测试完整流程
3. 🔄 优化唤醒词识别准确率
4. 🔄 添加唤醒反馈（声音/动画）
5. 🔄 添加使用统计和成本监控

---

**更新时间**: 2026-02-02
**状态**: ✅ 集成完成，准备测试
**集成方式**: 替换按键唤醒，保持原有流程
